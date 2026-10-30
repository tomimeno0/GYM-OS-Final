const { Op } = require("sequelize");
const { sequelize } = require("../config/db");
const {
  Dieta,
  DietaComida,
  ComidaConsumida,
  Objetivo,
  Usuario,
} = require("../models");
function calcularMacros(alimentos) {
  if (
    !Array.isArray(alimentos) ||
    alimentos.length < 1 ||
    alimentos.length > 30
  ) {
    throw new Error("Cada comida debe tener de 1 a 30 alimentos.");
  }
  const total = {
    calorias: 0,
    proteinas_g: 0,
    carbohidratos_g: 0,
    grasas_g: 0,
  };
  const nutrientes = ["calorias", "proteinas_g", "carbohidratos_g", "grasas_g"];
  const lista = [];
  for (let i = 0; i < alimentos.length; i++) {
    const alimento = alimentos[i];
    if (
      !alimento ||
      typeof alimento.nombre !== "string" ||
      !alimento.nombre.trim() ||
      alimento.nombre.length > 150 ||
      !["g", "ml", "porcion"].includes(alimento.unidad) ||
      typeof alimento.cantidad !== "number" ||
      !Number.isFinite(alimento.cantidad) ||
      alimento.cantidad <= 0 ||
      alimento.cantidad > 10000
    ) {
      throw new Error("Revisá nombre, cantidad y unidad de cada alimento.");
    }
    const alimentoValidado = {
      nombre: alimento.nombre.trim(),
      cantidad: alimento.cantidad,
      unidad: alimento.unidad,
    };
    let baseCalculo = 100;
    if (alimento.unidad === "porcion") {
      baseCalculo = 1;
    }
    for (let j = 0; j < nutrientes.length; j++) {
      const campo = nutrientes[j];
      const valor = alimento[campo];
      let maximo = 1000;
      if (campo === "calorias") {
        maximo = 10000;
      }
      if (
        typeof valor !== "number" ||
        !Number.isFinite(valor) ||
        valor < 0 ||
        valor > maximo
      ) {
        throw new Error("Los nutrientes deben ser números positivos o cero.");
      }
      alimentoValidado[campo] = valor;
      total[campo] += (valor * alimento.cantidad) / baseCalculo;
    }
    lista.push(alimentoValidado);
  }
  total.calorias = Math.round(total.calorias);
  total.proteinas_g = Math.round(total.proteinas_g * 100) / 100;
  total.carbohidratos_g = Math.round(total.carbohidratos_g * 100) / 100;
  total.grasas_g = Math.round(total.grasas_g * 100) / 100;
  if (
    total.calorias > 50000 ||
    total.proteinas_g > 9000 ||
    total.carbohidratos_g > 9000 ||
    total.grasas_g > 9000
  ) {
    throw new Error("Las cantidades totales son demasiado grandes.");
  }
  total.alimentos = lista;
  return total;
}
function datosComida(comida) {
  if (
    !comida ||
    typeof comida.nombre_comida !== "string" ||
    !comida.nombre_comida.trim() ||
    comida.nombre_comida.length > 100 ||
    !["desayuno", "almuerzo", "merienda", "cena", "colacion"].includes(
      comida.tipo_comida,
    )
  ) {
    throw new Error("Revisá nombre y tipo de comida.");
  }
  const datos = calcularMacros(comida.alimentos);
  datos.nombre_comida = comida.nombre_comida.trim();
  datos.tipo_comida = comida.tipo_comida;
  return datos;
}
async function actualizarComida(dieta_id, comida, transaction) {
  const datos = datosComida(comida);
  if (
    typeof comida.hora !== "string" ||
    !/^([01]\d|2[0-3]):[0-5]\d$/.test(comida.hora)
  ) {
    throw new Error("La hora de la comida debe ser válida.");
  }
  return DietaComida.create(
    {
      nombre_comida: datos.nombre_comida,
      tipo_comida: datos.tipo_comida,
      calorias: datos.calorias,
      proteinas_g: datos.proteinas_g,
      carbohidratos_g: datos.carbohidratos_g,
      grasas_g: datos.grasas_g,
      alimentos: datos.alimentos,
      dieta_id,
      hora: comida.hora,
      cantidad: 1,
      unidad: "porcion",
    },
    {
      transaction,
    },
  );
}
async function listarDietas(req, res) {
  try {
    res.json({
      items: await Dieta.findAll({
        where: {
          usuario_id: req.user.id,
          estado: {
            [Op.ne]: "eliminada",
          },
        },
        include: {
          model: DietaComida,
          as: "comidas",
        },
        order: [["fecha_creacion", "DESC"]],
      }),
    });
  } catch (error) {
    res.status(500).json({
      message: "No se pudieron consultar las dietas.",
    });
  }
}
async function actualizarDieta(req, res) {
  try {
    const {
      nombre,
      descripcion,
      objetivo_id,
      comidas,
      calorias_objetivo,
      proteinas_objetivo_g,
      carbohidratos_objetivo_g,
      grasas_objetivo_g,
    } = req.body;
    if (
      typeof nombre !== "string" ||
      nombre.trim().length < 2 ||
      nombre.length > 100 ||
      typeof descripcion !== "string" ||
      descripcion.length > 2000 ||
      !Array.isArray(comidas) ||
      !comidas.length ||
      comidas.length > 15
    ) {
      return res.status(400).json({
        message: "Revisá nombre, descripción y comidas.",
      });
    }
    const metasNutricionales = [
      calorias_objetivo,
      proteinas_objetivo_g,
      carbohidratos_objetivo_g,
      grasas_objetivo_g,
    ];
    for (let indice4 = 0; indice4 < metasNutricionales.length; indice4++) {
      const valor = metasNutricionales[indice4];
      if (
        typeof valor !== "number" ||
        !Number.isFinite(valor) ||
        valor < 0 ||
        valor > 9000
      ) {
        return res.status(400).json({
          message: "Revisá las metas de calorías y macros (0 a 9000).",
        });
      }
    }
    if (!Number.isInteger(calorias_objetivo)) {
      return res.status(400).json({
        message: "Las calorías objetivo deben ser enteras.",
      });
    }
    try {
      for (let indice5 = 0; indice5 < comidas.length; indice5++) {
        const comida = comidas[indice5];
        datosComida(comida);
        if (
          typeof comida.hora !== "string" ||
          !/^([01]\d|2[0-3]):[0-5]\d$/.test(comida.hora)
        ) {
          throw new Error("Revisá los horarios.");
        }
      }
    } catch (error) {
      return res.status(400).json({
        message: error.message,
      });
    }
    let dieta;
    if (req.params.id) {
      dieta = await Dieta.findOne({
        where: {
          id: req.params.id,
          usuario_id: req.user.id,
          estado: "activa",
        },
      });
    } else {
      dieta = null;
    }
    if (req.params.id && !dieta) {
      return res.status(404).json({
        message: "Dieta no encontrada.",
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
          (!dieta || dieta.objetivo_id !== objetivo_id))
      ) {
        return res.status(400).json({
          message: "Elegí un objetivo activo propio.",
        });
      }
    }
    const transaction = await sequelize.transaction();
    try {
      if (req.generacionIA) {
        const usuarioActual = await Usuario.findByPk(req.user.id, {
          transaction,
          lock: transaction.LOCK.UPDATE,
        });
        if (!usuarioActual || !usuarioActual.consentimiento_ia)
          throw new Error("Consentimiento retirado");
        const objetivoActual = await Objetivo.findOne({
          where: { id: objetivo_id, usuario_id: req.user.id, estado: "activo" },
          transaction,
        });
        if (!objetivoActual) throw new Error("El objetivo cambió");
      }
      if (dieta) {
        dieta = await Dieta.findOne({
          where: { id: dieta.id, usuario_id: req.user.id, estado: "activa" },
          transaction,
          lock: transaction.LOCK.UPDATE,
        });
        if (!dieta) throw new Error("Dieta no disponible");
      }
      let tipo_generacion = "manual";
      if (req.generacionIA) tipo_generacion = "ia";
      const datos = {
        tipo_generacion,
        nombre: nombre.trim(),
        descripcion,
        objetivo_id: objetivo_id || null,
        calorias_objetivo,
        proteinas_objetivo_g,
        carbohidratos_objetivo_g,
        grasas_objetivo_g,
        fecha_actualizacion: new Date(),
      };
      if (dieta) {
        await dieta.update(datos, {
          transaction,
        });
        await DietaComida.destroy({
          where: {
            dieta_id: dieta.id,
          },
          transaction,
        });
      } else {
        dieta = await Dieta.create(
          {
            nombre: datos.nombre,
            descripcion: datos.descripcion,
            objetivo_id: datos.objetivo_id,
            calorias_objetivo: datos.calorias_objetivo,
            proteinas_objetivo_g: datos.proteinas_objetivo_g,
            carbohidratos_objetivo_g: datos.carbohidratos_objetivo_g,
            grasas_objetivo_g: datos.grasas_objetivo_g,
            fecha_actualizacion: datos.fecha_actualizacion,
            usuario_id: req.user.id,
            tipo_generacion: datos.tipo_generacion,
            fecha_creacion: new Date(),
          },
          {
            transaction,
          },
        );
      }
      for (let indice6 = 0; indice6 < comidas.length; indice6++) {
        const comida = comidas[indice6];
        await actualizarComida(dieta.id, comida, transaction);
      }
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
    res.status(codigoRespuesta).json(dieta);
  } catch (error) {
    res.status(500).json({
      message: "No se pudo guardar la dieta.",
    });
  }
}
async function eliminarDieta(req, res) {
  try {
    if (req.body.confirmar !== true) {
      return res.status(400).json({
        message: "Confirmá la baja de la dieta.",
      });
    }
    const dieta = await Dieta.findOne({
      where: {
        id: req.params.id,
        usuario_id: req.user.id,
        estado: "activa",
      },
    });
    if (!dieta) {
      return res.status(404).json({
        message: "Dieta no encontrada.",
      });
    }
    await dieta.update({
      estado: "eliminada",
      fecha_actualizacion: new Date(),
    });
    res.status(204).end();
  } catch (error) {
    res.status(500).json({
      message: "No se pudo dar de baja la dieta.",
    });
  }
}
async function registrarComida(req, res) {
  try {
    let datos;
    try {
      datos = datosComida(req.body);
    } catch (error) {
      return res.status(400).json({
        message: error.message,
      });
    }
    const fecha = new Date(req.body.fecha_consumo);
    if (
      typeof req.body.fecha_consumo !== "string" ||
      !Number.isFinite(fecha.getTime()) ||
      fecha > new Date() ||
      fecha.getUTCFullYear() < 2000
    ) {
      return res.status(400).json({
        message: "La fecha de consumo debe ser válida y no futura.",
      });
    }
    const campos = {
      nombre_comida: datos.nombre_comida,
      tipo_comida: datos.tipo_comida,
      fecha_consumo: fecha,
      cantidad_consumida: 1,
      unidad: "porcion",
      calorias_totales: datos.calorias,
      proteinas_totales_g: datos.proteinas_g,
      carbohidratos_totales_g: datos.carbohidratos_g,
      grasas_totales_g: datos.grasas_g,
      alimentos: datos.alimentos,
    };
    let comida;
    if (req.params.id) {
      comida = await ComidaConsumida.findOne({
        where: {
          id: req.params.id,
          usuario_id: req.user.id,
        },
      });
      if (!comida) {
        return res.status(404).json({
          message: "Consumo no encontrado.",
        });
      }
      await comida.update(campos);
    } else {
      campos.usuario_id = req.user.id;
      comida = await ComidaConsumida.create(campos);
    }
    let codigoRespuesta2;
    if (req.params.id) {
      codigoRespuesta2 = 200;
    } else {
      codigoRespuesta2 = 201;
    }
    res.status(codigoRespuesta2).json(comida);
  } catch (error) {
    res.status(500).json({
      message: "No se pudo guardar el consumo.",
    });
  }
}
async function verMacros(req, res) {
  try {
    const formato = new Intl.DateTimeFormat("en-CA", {
      timeZone: req.user.zona_horaria,
    });
    const fecha = req.query.fecha || formato.format(new Date());
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(fecha) ||
      !Number.isFinite(Date.parse(fecha)) ||
      new Date(fecha).toISOString().slice(0, 10) !== fecha
    ) {
      return res.status(400).json({
        message: "Fecha no válida.",
      });
    }
    const consumos = await ComidaConsumida.findAll({
      where: {
        usuario_id: req.user.id,
      },
      order: [["fecha_consumo", "DESC"]],
    });
    const items = [];
    for (let i = 0; i < consumos.length; i++) {
      const consumo = consumos[i];
      if (formato.format(consumo.fecha_consumo) === fecha) {
        items.push(consumo);
      }
    }
    const totales = {
      calorias: 0,
      proteinas_g: 0,
      carbohidratos_g: 0,
      grasas_g: 0,
    };
    for (let indice7 = 0; indice7 < items.length; indice7++) {
      const c = items[indice7];
      totales.calorias += c.calorias_totales;
      totales.proteinas_g += c.proteinas_totales_g;
      totales.carbohidratos_g += c.carbohidratos_totales_g;
      totales.grasas_g += c.grasas_totales_g;
    }
    const nutrientes = Object.keys(totales);
    for (let indice8 = 0; indice8 < nutrientes.length; indice8++) {
      const campo = nutrientes[indice8];
      totales[campo] = Math.round(totales[campo] * 100) / 100;
    }
    const dieta = await Dieta.findOne({
      where: {
        usuario_id: req.user.id,
        estado: "activa",
      },
      order: [
        ["fecha_actualizacion", "DESC"],
        ["fecha_creacion", "DESC"],
      ],
    });
    res.json({
      fecha,
      items,
      totales,
      dieta,
    });
  } catch (error) {
    res.status(500).json({
      message: "No se pudieron consultar los macros.",
    });
  }
}
async function eliminarConsumo(req, res) {
  try {
    if (req.body.confirmar !== true) {
      return res.status(400).json({
        message: "Confirmá la eliminación.",
      });
    }
    const comida = await ComidaConsumida.findOne({
      where: {
        id: req.params.id,
        usuario_id: req.user.id,
      },
    });
    if (!comida) {
      return res.status(404).json({
        message: "Consumo no encontrado.",
      });
    }
    await comida.destroy();
    res.status(204).end();
  } catch (error) {
    res.status(500).json({
      message: "No se pudo eliminar el consumo.",
    });
  }
}
module.exports = {
  calcularMacros,
  actualizarComida,
  listarDietas,
  actualizarDieta,
  eliminarDieta,
  registrarComida,
  verMacros,
  eliminarConsumo,
};
