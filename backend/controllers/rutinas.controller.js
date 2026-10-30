const { Op } = require("sequelize");
const { sequelize } = require("../config/db");
const {
  Rutina,
  RutinaEjercicio,
  Objetivo,
  Entrenamiento,
} = require("../models");
const catalogo = require("../models/exercises/exercises.json");
function validarEjercicios(ejercicios) {
  if (
    !Array.isArray(ejercicios) ||
    ejercicios.length < 1 ||
    ejercicios.length > 80
  ) {
    throw new Error("Ingresá entre 1 y 80 ejercicios.");
  }
  const posiciones = [];
  const ejerciciosValidados = [];
  for (let i = 0; i < ejercicios.length; i++) {
    const e = ejercicios[i];
    if (!e || typeof e !== "object") {
      throw new Error("Revisá los ejercicios.");
    }
    let ficha = null;
    if (e.ejercicio_id) {
      for (let j = 0; j < catalogo.length; j++) {
        if (catalogo[j].id === e.ejercicio_id) {
          ficha = catalogo[j];
          break;
        }
      }
    }
    if (e.ejercicio_id && !ficha) {
      throw new Error("Un ejercicio no existe en el catálogo.");
    }
    let nombre;
    if (ficha) {
      nombre = ficha.name;
    } else {
      nombre = e.nombre_ejercicio;
    }
    if (
      typeof nombre !== "string" ||
      !nombre.trim() ||
      nombre.length > 150 ||
      !Number.isInteger(e.dia_semana) ||
      e.dia_semana < 1 ||
      e.dia_semana > 7 ||
      !Number.isInteger(e.series) ||
      e.series < 1 ||
      e.series > 20 ||
      !Number.isInteger(e.repeticiones) ||
      e.repeticiones < 1 ||
      e.repeticiones > 200
    ) {
      throw new Error("Revisá nombre, día, series y repeticiones.");
    }
    if (
      typeof e.peso_sugerido_kg !== "number" ||
      !Number.isFinite(e.peso_sugerido_kg) ||
      e.peso_sugerido_kg < 0 ||
      e.peso_sugerido_kg > 600 ||
      !Number.isInteger(e.descanso_segundos) ||
      e.descanso_segundos < 0 ||
      e.descanso_segundos > 900 ||
      (e.observaciones &&
        (typeof e.observaciones !== "string" || e.observaciones.length > 1000))
    ) {
      throw new Error("Revisá peso, descanso y observaciones.");
    }
    let orden;
    if (e.orden === undefined) {
      orden = i;
    } else {
      orden = e.orden;
    }
    if (
      !Number.isInteger(orden) ||
      orden < 0 ||
      orden > 1000 ||
      posiciones.includes(e.dia_semana + ":" + orden)
    ) {
      throw new Error("El orden se repite dentro de un día.");
    }
    posiciones.push(e.dia_semana + ":" + orden);
    let ejercicioId;
    if (ficha) {
      ejercicioId = ficha.id;
    } else {
      ejercicioId = null;
    }
    let grupoMuscular;
    if (ficha) {
      grupoMuscular = ficha.body_part;
    } else {
      grupoMuscular = "";
    }
    ejerciciosValidados.push({
      ejercicio_id: ejercicioId,
      nombre_ejercicio: nombre.trim(),
      grupo_muscular: grupoMuscular,
      dia_semana: e.dia_semana,
      orden,
      series: e.series,
      repeticiones: e.repeticiones,
      peso_sugerido_kg: e.peso_sugerido_kg,
      descanso_segundos: e.descanso_segundos,
      observaciones: e.observaciones || "",
    });
  }
  return ejerciciosValidados;
}
async function agregarEjercicio(rutina_id, datos, transaction) {
  const ejercicio = {
    rutina_id,
    ejercicio_id: datos.ejercicio_id,
    nombre_ejercicio: datos.nombre_ejercicio,
    grupo_muscular: datos.grupo_muscular,
    dia_semana: datos.dia_semana,
    orden: datos.orden,
    series: datos.series,
    repeticiones: datos.repeticiones,
    peso_sugerido_kg: datos.peso_sugerido_kg,
    descanso_segundos: datos.descanso_segundos,
    observaciones: datos.observaciones,
  };
  return RutinaEjercicio.create(ejercicio, {
    transaction,
  });
}
async function eliminarEjercicio(rutina_id, transaction) {
  return RutinaEjercicio.destroy({
    where: {
      rutina_id,
    },
    transaction,
  });
}
async function actualizarRutinaEjercicio(rutina_id, ejercicios, transaction) {
  await eliminarEjercicio(rutina_id, transaction);
  for (let indice = 0; indice < ejercicios.length; indice++) {
    const ejercicio = ejercicios[indice];
    await agregarEjercicio(rutina_id, ejercicio, transaction);
  }
}
async function guardarRutina(
  usuario_id,
  datos,
  ejercicios,
  rutina,
  transaction,
) {
  if (rutina) {
    await rutina.update(datos, {
      transaction,
    });
  } else {
    rutina = await Rutina.create(
      {
        nombre: datos.nombre,
        descripcion: datos.descripcion,
        objetivo_id: datos.objetivo_id,
        tipo_generacion: datos.tipo_generacion,
        fecha_actualizacion: datos.fecha_actualizacion,
        usuario_id,
        fecha_creacion: new Date(),
      },
      {
        transaction,
      },
    );
  }
  await actualizarRutinaEjercicio(rutina.id, ejercicios, transaction);
  return rutina;
}
async function listarRutinas(req, res) {
  try {
    const registros = await Rutina.findAll({
      where: {
        usuario_id: req.user.id,
        estado: {
          [Op.ne]: "eliminada",
        },
      },
      include: {
        model: RutinaEjercicio,
        as: "ejercicios",
      },
      order: [
        ["fecha_creacion", "DESC"],
        [
          {
            model: RutinaEjercicio,
            as: "ejercicios",
          },
          "dia_semana",
          "ASC",
        ],
        [
          {
            model: RutinaEjercicio,
            as: "ejercicios",
          },
          "orden",
          "ASC",
        ],
      ],
    });
    const items = [];
    for (let i = 0; i < registros.length; i++) {
      const rutina = registros[i].toJSON();
      for (let j = 0; j < rutina.ejercicios.length; j++) {
        rutina.ejercicios[j].dia_semana = Number(
          rutina.ejercicios[j].dia_semana,
        );
      }
      items.push(rutina);
    }
    res.json({
      items,
    });
  } catch (error) {
    res.status(500).json({
      message: "No se pudieron consultar las rutinas.",
    });
  }
}
async function actualizarRutina(req, res) {
  try {
    const { nombre, descripcion, objetivo_id } = req.body;
    if (
      typeof nombre !== "string" ||
      nombre.trim().length < 2 ||
      nombre.length > 100 ||
      (descripcion !== undefined &&
        (typeof descripcion !== "string" || descripcion.length > 2000))
    ) {
      return res.status(400).json({
        message: "Revisá nombre y descripción.",
      });
    }
    let ejercicios;
    try {
      ejercicios = validarEjercicios(req.body.ejercicios);
    } catch (error) {
      return res.status(400).json({
        message: error.message,
      });
    }
    let rutina;
    if (req.params.id) {
      rutina = await Rutina.findOne({
        where: {
          id: req.params.id,
          usuario_id: req.user.id,
          estado: "activa",
        },
      });
    } else {
      rutina = null;
    }
    if (req.params.id && !rutina) {
      return res.status(404).json({
        message: "Rutina no encontrada.",
      });
    }
    if (objetivo_id) {
      const objetivo = await Objetivo.findOne({
        where: {
          id: objetivo_id,
          usuario_id: req.user.id,
        },
      });
      if (
        !objetivo ||
        (objetivo.estado !== "activo" &&
          (!rutina || rutina.objetivo_id !== objetivo_id))
      ) {
        return res.status(400).json({
          message: "Elegí un objetivo activo propio.",
        });
      }
    }
    const transaction = await sequelize.transaction();
    try {
      let tipoGeneracion;
      if (rutina) {
        tipoGeneracion = rutina.tipo_generacion;
      } else {
        tipoGeneracion = "manual";
      }
      rutina = await guardarRutina(
        req.user.id,
        {
          nombre: nombre.trim(),
          descripcion: descripcion || "",
          objetivo_id: objetivo_id || null,
          tipo_generacion: tipoGeneracion,
          fecha_actualizacion: new Date(),
        },
        ejercicios,
        rutina,
        transaction,
      );
      await transaction.commit();
    } catch (errorGuardado) {
      await transaction.rollback();
      throw errorGuardado;
    }
    let codigoRespuesta;
    if (req.params.id) {
      codigoRespuesta = 200;
    } else {
      codigoRespuesta = 201;
    }
    res.status(codigoRespuesta).json(rutina);
  } catch (error) {
    res.status(500).json({
      message: "No se pudo guardar la rutina.",
    });
  }
}
async function eliminarRutina(req, res) {
  try {
    if (req.body.confirmar !== true) {
      return res.status(400).json({
        message: "Confirmá la baja.",
      });
    }
    const rutina = await Rutina.findOne({
      where: {
        id: req.params.id,
        usuario_id: req.user.id,
        estado: "activa",
      },
    });
    if (!rutina) {
      return res.status(404).json({
        message: "Rutina no encontrada.",
      });
    }
    if (
      await Entrenamiento.findOne({
        where: {
          rutina_id: rutina.id,
          usuario_id: req.user.id,
          estado: "iniciado",
        },
      })
    ) {
      return res.status(409).json({
        message: "Terminá primero el entrenamiento en curso.",
      });
    }
    await rutina.update({
      estado: "eliminada",
      fecha_actualizacion: new Date(),
    });
    res.status(204).end();
  } catch (error) {
    res.status(500).json({
      message: "No se pudo dar de baja la rutina.",
    });
  }
}
function listarEjercicios(req, res) {
  const texto = String(req.query.buscar || "")
    .toLowerCase()
    .slice(0, 100);
  const grupo = String(req.query.grupo || "");
  const pagina = Math.max(
    1,
    Math.min(1000, parseInt(req.query.pagina, 10) || 1),
  );
  const encontrados = [];
  for (let i = 0; i < catalogo.length; i++) {
    const ejercicio = catalogo[i];
    const coincideTexto =
      !texto ||
      ejercicio.name.toLowerCase().includes(texto) ||
      ejercicio.body_part.toLowerCase().includes(texto);
    const coincideGrupo = !grupo || ejercicio.body_part === grupo;
    if (coincideTexto && coincideGrupo) {
      encontrados.push(ejercicio);
    }
  }
  const grupos = [];
  for (let indice2 = 0; indice2 < catalogo.length; indice2++) {
    const e = catalogo[indice2];
    if (!grupos.includes(e.body_part)) {
      grupos.push(e.body_part);
    }
  }
  res.json({
    items: encontrados.slice((pagina - 1) * 24, pagina * 24),
    total: encontrados.length,
    pagina,
    grupos: grupos.sort(),
  });
}
module.exports = {
  listarRutinas,
  actualizarRutina,
  eliminarRutina,
  listarEjercicios,
  validarEjercicios,
  agregarEjercicio,
  eliminarEjercicio,
  actualizarRutinaEjercicio,
  guardarRutina,
};
