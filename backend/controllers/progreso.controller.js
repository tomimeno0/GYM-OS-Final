const { Op } = require("sequelize");
const {
  MedicionFisica,
  Objetivo,
  Entrenamiento,
  Rutina,
  Dieta,
} = require("../models");
function calcularPorcentaje(inicial, actual, meta) {
  if (inicial === meta) {
    if (actual === meta) {
      return 100;
    }
    return 0;
  }
  let porcentaje = ((actual - inicial) / (meta - inicial)) * 100;
  if (porcentaje <= 0) {
    porcentaje = 0;
  }
  if (porcentaje > 100) {
    porcentaje = 100;
  }
  return Math.round(porcentaje * 10) / 10;
}
async function verProgreso(req, res) {
  try {
    const mediciones = await MedicionFisica.findAll({
      where: {
        usuario_id: req.user.id,
      },
      order: [["fecha_medicion", "ASC"]],
    });
    const objetivos = await Objetivo.findAll({
      where: {
        usuario_id: req.user.id,
        estado: {
          [Op.ne]: "eliminado",
        },
      },
      order: [["fecha_inicio", "DESC"]],
    });
    const entrenamientos = await Entrenamiento.findAll({
      where: {
        usuario_id: req.user.id,
        estado: "completado",
      },
      order: [["fecha", "DESC"]],
    });
    const hoy = new Intl.DateTimeFormat("en-CA", {
      timeZone: req.user.zona_horaria,
    }).format(new Date());
    const avances = [];
    for (let indice = 0; indice < objetivos.length; indice++) {
      const o = objetivos[indice];
      const fin = o.fecha_completado || hoy;
      const hasta = o.fecha_cierre || new Date();
      const sesiones = [];
      for (let i = 0; i < entrenamientos.length; i++) {
        const entrenamiento = entrenamientos[i];
        if (entrenamiento.fecha_fin && entrenamiento.fecha_fin <= hasta) {
          sesiones.push(entrenamiento);
        }
      }
      const medidas = [];
      for (let i = 0; i < mediciones.length; i++) {
        const medicion = mediciones[i];
        const diaMedicion = new Intl.DateTimeFormat("en-CA", {
          timeZone: req.user.zona_horaria,
        }).format(medicion.fecha_medicion);
        if (medicion.fecha_medicion <= hasta && diaMedicion <= fin) {
          medidas.push(medicion);
        }
      }
      const ultima = medidas[medidas.length - 1];
      let actual = o.valor_inicial;
      if (o.tipo === "mejorar_resistencia") {
        actual = 0;
        for (let i = 0; i < sesiones.length; i++) {
          const sesion = sesiones[i];
          if (
            sesion.fecha >= o.fecha_inicio &&
            sesion.fecha <= fin &&
            sesion.distancia_km > actual
          ) {
            actual = sesion.distancia_km;
          }
        }
      } else if (o.tipo === "aumentar_frecuencia_entrenamiento") {
        const inicioSemana = new Date(fin + "T12:00:00Z");
        inicioSemana.setUTCDate(
          inicioSemana.getUTCDate() - ((inicioSemana.getUTCDay() + 6) % 7),
        );
        const desde = inicioSemana.toISOString().slice(0, 10);
        actual = 0;
        for (let i = 0; i < sesiones.length; i++) {
          const sesion = sesiones[i];
          if (
            sesion.fecha >= desde &&
            sesion.fecha >= o.fecha_inicio &&
            sesion.fecha <= fin
          ) {
            actual++;
          }
        }
      } else if (ultima) {
        if (o.tipo === "definir") {
          actual = ultima.grasa_corporal;
        } else {
          actual = ultima.peso_kg;
        }
      }
      const avance = o.toJSON();
      avance.valor_actual = actual;
      avance.porcentaje = 0;
      if (actual !== null) {
        avance.porcentaje = calcularPorcentaje(
          o.valor_inicial,
          actual,
          o.valor_objetivo,
        );
      }
      avances.push(avance);
    }
    res.json({
      mediciones,
      objetivos: avances,
      entrenamientos_completados: entrenamientos.length,
      rutinas: await Rutina.count({
        where: {
          usuario_id: req.user.id,
          estado: "activa",
        },
      }),
      dietas: await Dieta.count({
        where: {
          usuario_id: req.user.id,
          estado: "activa",
        },
      }),
    });
  } catch (error) {
    res.status(500).json({
      message: "No se pudo consultar el progreso.",
    });
  }
}
module.exports = {
  verProgreso,
  calcularPorcentaje,
};
