const { Op } = require("sequelize");
const { Objetivo, MedicionFisica } = require("../models");
const { registrarEvento } = require("./bitacora.controller");
async function visuaizarObjetivo(req, res) {
  try {
    const items = await Objetivo.findAll({
      where: {
        usuario_id: req.user.id,
        estado: {
          [Op.ne]: "eliminado",
        },
      },
      order: [
        ["fecha_inicio", "DESC"],
        ["id", "DESC"],
      ],
    });
    res.json({
      items,
    });
  } catch (error) {
    res.status(500).json({
      message: "No se pudieron consultar los objetivos.",
    });
  }
}
async function definirObjeto(req, res) {
  try {
    const {
      nombre,
      descripcion,
      tipo,
      valor_objetivo,
      unidad,
      frecuencia_semanal,
      fecha_inicio,
      fecha_fin_estimada,
    } = req.body;
    if (
      typeof nombre !== "string" ||
      nombre.trim().length < 2 ||
      nombre.length > 100 ||
      (descripcion !== undefined &&
        (typeof descripcion !== "string" || descripcion.length > 2000))
    ) {
      return res.status(400).json({
        message: "Revisá el nombre y la descripción.",
      });
    }
    if (
      ![
        "bajar_peso",
        "ganar_masa_muscular",
        "mejorar_resistencia",
        "aumentar_frecuencia_entrenamiento",
        "definir",
        "mantener_peso",
      ].includes(tipo)
    ) {
      return res.status(400).json({
        message: "El tipo de objetivo no es válido.",
      });
    }
    if (
      typeof valor_objetivo !== "number" ||
      !Number.isFinite(valor_objetivo) ||
      valor_objetivo <= 0 ||
      valor_objetivo > 1000
    ) {
      return res.status(400).json({
        message: "El valor objetivo no es válido.",
      });
    }
    if (
      frecuencia_semanal !== undefined &&
      (!Number.isInteger(frecuencia_semanal) ||
        frecuencia_semanal < 1 ||
        frecuencia_semanal > 7)
    ) {
      return res.status(400).json({
        message: "La frecuencia debe ser de 1 a 7 días.",
      });
    }
    if (
      typeof fecha_inicio !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(fecha_inicio) ||
      !Number.isFinite(Date.parse(fecha_inicio)) ||
      new Date(fecha_inicio).toISOString().slice(0, 10) !== fecha_inicio
    ) {
      return res.status(400).json({
        message: "La fecha inicial no es válida.",
      });
    }
    if (
      fecha_fin_estimada &&
      (!/^\d{4}-\d{2}-\d{2}$/.test(fecha_fin_estimada) ||
        !Number.isFinite(Date.parse(fecha_fin_estimada)) ||
        new Date(fecha_fin_estimada).toISOString().slice(0, 10) !==
          fecha_fin_estimada ||
        fecha_fin_estimada < fecha_inicio)
    ) {
      return res.status(400).json({
        message: "La fecha final debe ser válida y posterior a la inicial.",
      });
    }
    const medida = await MedicionFisica.findOne({
      where: {
        usuario_id: req.user.id,
      },
      order: [["fecha_medicion", "DESC"]],
    });
    if (!medida) {
      return res.status(409).json({
        message: "Primero registrá tus medidas.",
      });
    }
    if (
      await Objetivo.findOne({
        where: {
          usuario_id: req.user.id,
          estado: "activo",
        },
      })
    ) {
      return res.status(409).json({
        message: "Ya tenés un objetivo activo.",
      });
    }
    let inicial = medida.peso_kg;
    if (tipo === "definir") {
      if (
        unidad !== "%" ||
        medida.grasa_corporal === null ||
        valor_objetivo >= medida.grasa_corporal ||
        valor_objetivo < 5
      ) {
        return res.status(400).json({
          message:
            "Para definir, registrá grasa corporal y elegí una meta menor, de al menos 5 %.",
        });
      }
      inicial = medida.grasa_corporal;
    } else if (tipo === "mejorar_resistencia") {
      if (unidad !== "km") {
        return res.status(400).json({
          message: "Resistencia se mide en km.",
        });
      }
      inicial = 0;
    } else if (tipo === "aumentar_frecuencia_entrenamiento") {
      if (
        unidad !== "entrenamientos" ||
        !Number.isInteger(valor_objetivo) ||
        valor_objetivo > 7
      ) {
        return res.status(400).json({
          message: "Elegí de 1 a 7 entrenamientos semanales.",
        });
      }
      inicial = 0;
    } else {
      if (unidad !== "kg" || valor_objetivo < 20 || valor_objetivo > 400) {
        return res.status(400).json({
          message: "Este objetivo usa un peso de 20 a 400 kg.",
        });
      }
      if (tipo === "bajar_peso" && valor_objetivo >= medida.peso_kg) {
        return res.status(400).json({
          message: "La meta debe ser menor al peso actual.",
        });
      }
      if (tipo === "ganar_masa_muscular" && valor_objetivo <= medida.peso_kg) {
        return res.status(400).json({
          message: "La meta debe ser mayor al peso actual.",
        });
      }
    }
    const objetivo = await Objetivo.create({
      usuario_id: req.user.id,
      usuario_activo: req.user.id,
      medicion_inicio_id: medida.id,
      nombre: nombre.trim(),
      descripcion: descripcion || "",
      tipo,
      valor_objetivo,
      unidad,
      valor_inicial: inicial,
      peso_inicial: medida.peso_kg,
      frecuencia_semanal: frecuencia_semanal || 3,
      fecha_inicio,
      fecha_fin_estimada: fecha_fin_estimada || null,
    });
    await registrarEvento(req.user.id, "CU009_CREAR_OBJETIVO", "objetivos");
    res.status(201).json(objetivo);
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        message: "Ya tenés un objetivo activo.",
      });
    }
    res.status(500).json({
      message: "No se pudo guardar el objetivo.",
    });
  }
}
async function marcarCompletado(req, res) {
  try {
    if (req.body.confirmar !== true) {
      return res.status(400).json({
        message: "Confirmá la finalización.",
      });
    }
    const objetivo = await Objetivo.findOne({
      where: {
        id: req.params.id,
        usuario_id: req.user.id,
      },
    });
    if (!objetivo) {
      return res.status(404).json({
        message: "Objetivo no encontrado.",
      });
    }
    if (objetivo.estado !== "activo") {
      return res.status(409).json({
        message: "El objetivo ya no está activo.",
      });
    }
    const fecha = new Intl.DateTimeFormat("en-CA", {
      timeZone: req.user.zona_horaria,
    }).format(new Date());
    await objetivo.update({
      estado: "completado",
      usuario_activo: null,
      fecha_completado: fecha,
      fecha_cierre: new Date(),
    });
    await registrarEvento(req.user.id, "CU012_COMPLETAR_OBJETIVO", "objetivos");
    res.json(objetivo);
  } catch (error) {
    res.status(500).json({
      message: "No se pudo completar el objetivo.",
    });
  }
}
async function eliminarObjetivo(req, res) {
  try {
    if (req.body.confirmar !== true) {
      return res.status(400).json({
        message: "Confirmá la baja.",
      });
    }
    const objetivo = await Objetivo.findOne({
      where: {
        id: req.params.id,
        usuario_id: req.user.id,
      },
    });
    if (!objetivo) {
      return res.status(404).json({
        message: "Objetivo no encontrado.",
      });
    }
    if (objetivo.estado === "eliminado") {
      return res.status(409).json({
        message: "El objetivo ya está dado de baja.",
      });
    }
    await objetivo.update({
      estado: "eliminado",
      usuario_activo: null,
    });
    await registrarEvento(req.user.id, "CU013_ELIMINAR_OBJETIVO", "objetivos");
    res.status(204).end();
  } catch (error) {
    res.status(500).json({
      message: "No se pudo dar de baja el objetivo.",
    });
  }
}
module.exports = {
  visuaizarObjetivo,
  definirObjeto,
  marcarCompletado,
  eliminarObjetivo,
};
