const { MedicionFisica } = require("../models");
const { registrarEvento } = require("./bitacora.controller");
function cambiarPeso(peso) {
  if (
    typeof peso !== "number" ||
    !Number.isFinite(peso) ||
    peso < 20 ||
    peso > 400
  ) {
    throw new Error("El peso debe estar entre 20 y 400 kg.");
  }
  return peso;
}
function cambiarAltura(altura) {
  if (
    typeof altura !== "number" ||
    !Number.isFinite(altura) ||
    altura < 80 ||
    altura > 250
  ) {
    throw new Error("La altura debe estar entre 80 y 250 cm.");
  }
  return altura;
}
function cambiarPorcMusculo(porcentaje) {
  if (
    porcentaje !== null &&
    (typeof porcentaje !== "number" ||
      !Number.isFinite(porcentaje) ||
      porcentaje < 0 ||
      porcentaje > 100)
  ) {
    throw new Error("El porcentaje muscular no es válido.");
  }
  return porcentaje;
}
function cambiarPorcGraso(porcentaje) {
  if (
    porcentaje !== null &&
    (typeof porcentaje !== "number" ||
      !Number.isFinite(porcentaje) ||
      porcentaje < 0 ||
      porcentaje > 70)
  ) {
    throw new Error("El porcentaje de grasa no es válido.");
  }
  return porcentaje;
}
function cambiarNivelActividad(nivel) {
  if (!["baja", "media", "alta"].includes(nivel)) {
    throw new Error("Elegí actividad baja, media o alta.");
  }
  return nivel;
}
async function actualizarMedicion(req, res) {
  try {
    const datos = req.body;
    const peso_kg = cambiarPeso(datos.peso_kg);
    const altura_cm = cambiarAltura(datos.altura_cm);
    let grasaIngresada;
    if (datos.grasa_corporal === null || datos.grasa_corporal === undefined) {
      grasaIngresada = null;
    } else {
      grasaIngresada = datos.grasa_corporal;
    }
    const grasa_corporal = cambiarPorcGraso(grasaIngresada);
    let musculoIngresado;
    if (
      datos.musculo_corporal === null ||
      datos.musculo_corporal === undefined
    ) {
      musculoIngresado = null;
    } else {
      musculoIngresado = datos.musculo_corporal;
    }
    const musculo_corporal = cambiarPorcMusculo(musculoIngresado);
    const nivel_actividad = cambiarNivelActividad(datos.nivel_actividad);
    if (
      grasa_corporal !== null &&
      musculo_corporal !== null &&
      grasa_corporal + musculo_corporal > 100
    ) {
      return res.status(400).json({
        message: "Grasa y músculo no pueden sumar más de 100 %.",
      });
    }
    let fecha;
    if (datos.fecha_medicion) {
      fecha = new Date(datos.fecha_medicion);
    } else {
      fecha = new Date();
    }
    if (!Number.isFinite(fecha.getTime()) || fecha > new Date()) {
      return res.status(400).json({
        message: "La fecha no es válida o está en el futuro.",
      });
    }
    const anterior = await MedicionFisica.findOne({
      where: {
        usuario_id: req.user.id,
      },
      order: [["fecha_medicion", "DESC"]],
    });
    const inicial = req.path.endsWith("/initial");
    if (inicial && anterior) {
      return res.status(409).json({
        message: "Ya cargaste las medidas iniciales.",
      });
    }
    if (!inicial && !anterior) {
      return res.status(409).json({
        message: "Primero cargá las medidas iniciales.",
      });
    }
    if (anterior && fecha <= anterior.fecha_medicion) {
      return res.status(400).json({
        message: "La medición debe ser posterior a la anterior.",
      });
    }
    const perimetros = ["cintura_cm", "pecho_cm", "brazos_cm", "piernas_cm"];
    for (let indice = 0; indice < perimetros.length; indice++) {
      const campo = perimetros[indice];
      if (
        datos[campo] !== undefined &&
        datos[campo] !== null &&
        (typeof datos[campo] !== "number" ||
          !Number.isFinite(datos[campo]) ||
          datos[campo] <= 0 ||
          datos[campo] > 300)
      ) {
        return res.status(400).json({
          message: "Revisá los perímetros corporales.",
        });
      }
    }
    let usuarioInicial;
    if (inicial) {
      usuarioInicial = req.user.id;
    } else {
      usuarioInicial = null;
    }
    let cinturaCm;
    if (datos.cintura_cm === null || datos.cintura_cm === undefined) {
      cinturaCm = null;
    } else {
      cinturaCm = datos.cintura_cm;
    }
    let pechoCm;
    if (datos.pecho_cm === null || datos.pecho_cm === undefined) {
      pechoCm = null;
    } else {
      pechoCm = datos.pecho_cm;
    }
    let brazosCm;
    if (datos.brazos_cm === null || datos.brazos_cm === undefined) {
      brazosCm = null;
    } else {
      brazosCm = datos.brazos_cm;
    }
    let piernasCm;
    if (datos.piernas_cm === null || datos.piernas_cm === undefined) {
      piernasCm = null;
    } else {
      piernasCm = datos.piernas_cm;
    }
    const medicion = await MedicionFisica.create({
      usuario_id: req.user.id,
      usuario_inicial: usuarioInicial,
      peso_kg,
      altura_cm,
      grasa_corporal,
      musculo_corporal,
      nivel_actividad,
      fecha_medicion: fecha,
      cintura_cm: cinturaCm,
      pecho_cm: pechoCm,
      brazos_cm: brazosCm,
      piernas_cm: piernasCm,
    });
    let accionEvento;
    if (inicial) {
      accionEvento = "CU007_MEDIDAS_INICIALES";
    } else {
      accionEvento = "CU008_MEDIDAS";
    }
    await registrarEvento(req.user.id, accionEvento, "mediciones");
    res.status(201).json(medicion);
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        message: "Ya existe una medición inicial.",
      });
    }
    if (error.name === "Error") {
      return res.status(400).json({
        message: error.message,
      });
    }
    res.status(500).json({
      message: "No se pudo guardar la medición.",
    });
  }
}
async function listarMediciones(req, res) {
  try {
    const items = await MedicionFisica.findAll({
      where: {
        usuario_id: req.user.id,
      },
      order: [["fecha_medicion", "DESC"]],
    });
    res.json({
      items,
    });
  } catch (error) {
    res.status(500).json({
      message: "No se pudieron consultar las mediciones.",
    });
  }
}
module.exports = {
  actualizarMedicion,
  listarMediciones,
  cambiarPeso,
  cambiarAltura,
  cambiarPorcMusculo,
  cambiarPorcGraso,
  cambiarNivelActividad,
};
