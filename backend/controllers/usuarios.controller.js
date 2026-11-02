const jwt = require("jsonwebtoken");
const { sequelize } = require("../config/db");
const { Usuario, Rol, UsuarioRol, Sesion } = require("../models");
const {
  encriptarIrreversible,
  compararPassword,
  tokenNuevo,
  hashToken,
  encriptarRreversible,
  desencriptar,
} = require("./seguridad.controller");
const { registrarEvento } = require("./bitacora.controller");
function datosPublicos(usuario) {
  return {
    id: usuario.id,
    nombre: usuario.nombre,
    apellido: usuario.apellido,
    email: usuario.email,
    telefono: desencriptar(usuario.telefono_cifrado),
    genero: usuario.genero,
    fecha_nacimiento: usuario.fecha_nacimiento,
    zona_horaria: usuario.zona_horaria,
    consentimiento_ia: usuario.consentimiento_ia,
    administrador: Boolean(usuario.administrador),
    permisos: usuario.permisos || [],
  };
}
async function cargarRoles(usuario) {
  const roles = await usuario.getRoles();
  usuario.administrador = false;
  usuario.permisos = [];
  for (let i = 0; i < roles.length; i++) {
    if (roles[i].nombre === "Administrador") usuario.administrador = true;
    for (let j = 0; j < roles[i].permisos.length; j++) {
      if (!usuario.permisos.includes(roles[i].permisos[j]))
        usuario.permisos.push(roles[i].permisos[j]);
    }
  }
}
async function abrirSesion(usuario, res, transaction) {
  const token = jwt.sign(
    {
      id: usuario.id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "8h",
      jwtid: tokenNuevo(),
    },
  );
  await Sesion.create(
    {
      usuario_id: usuario.id,
      token_hash: hashToken(token),
      fecha_creacion: new Date(),
      fecha_expiracion: new Date(Date.now() + 8 * 3600000),
    },
    {
      transaction,
    },
  );
  res.cookie("gymos100", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 8 * 3600000,
    path: "/",
  });
}
async function registrarUsuario(req, res) {
  try {
    const { nombre, apellido, email, password } = req.body;
    if (
      typeof nombre !== "string" ||
      nombre.trim().length < 2 ||
      nombre.length > 100 ||
      (apellido !== undefined &&
        (typeof apellido !== "string" || apellido.length > 100))
    ) {
      return res.status(400).json({
        message: "Revisá nombre y apellido.",
      });
    }
    if (
      typeof email !== "string" ||
      email.length > 150 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      typeof password !== "string" ||
      password.length < 10 ||
      Buffer.byteLength(password) > 72
    ) {
      return res.status(400).json({
        message:
          "Ingresá un correo válido y una contraseña de 10 a 72 caracteres.",
      });
    }
    const correo = email.trim().toLowerCase();
    if (
      await Usuario.findOne({
        where: {
          email: correo,
        },
      })
    ) {
      return res.status(409).json({
        message: "Ese correo ya está registrado.",
      });
    }
    const password_hash = await encriptarIrreversible(password);
    let usuario;
    const transaction = await sequelize.transaction();
    try {
      usuario = await Usuario.create(
        {
          nombre: nombre.trim(),
          apellido: apellido || "",
          email: correo,
          password_hash,
          fecha_registro: new Date(),
        },
        {
          transaction,
        },
      );
      const rol = await Rol.findOne({
        where: {
          nombre: "Cliente",
        },
        transaction,
      });
      if (!rol) {
        throw new Error("Falta inicializar el rol Cliente");
      }
      await UsuarioRol.create(
        {
          usuario_id: usuario.id,
          rol_id: rol.id,
          fecha_asignacion: new Date(),
        },
        {
          transaction,
        },
      );
      await abrirSesion(usuario, res, transaction);
      await registrarEvento(
        usuario.id,
        "CU001_REGISTRO",
        "cuentas",
        transaction,
      );
      await transaction.commit();
    } catch (errorGuardado) {
      await transaction.rollback();
      throw errorGuardado;
    }
    res.status(201).json({
      user: datosPublicos(usuario),
    });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        message: "Ese correo ya está registrado.",
      });
    }
    res.status(500).json({
      message: "No se pudo registrar la cuenta.",
    });
  }
}
async function iniciarSesion(req, res) {
  let transaction;
  try {
    const { email, password } = req.body;
    if (
      typeof email !== "string" ||
      email.length > 150 ||
      typeof password !== "string" ||
      Buffer.byteLength(password) > 72
    ) {
      return res.status(400).json({ message: "Ingresá correo y contraseña." });
    }
    transaction = await sequelize.transaction();
    const usuario = await Usuario.findOne({
      where: { email: email.trim().toLowerCase(), estado: "activo" },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!usuario) {
      await transaction.rollback();
      return res
        .status(401)
        .json({ message: "Correo o contraseña incorrectos." });
    }
    const ahora = new Date();
    if (usuario.bloqueado_hasta && usuario.bloqueado_hasta > ahora) {
      const segundos = Math.max(
        1,
        Math.ceil((usuario.bloqueado_hasta.getTime() - ahora.getTime()) / 1000),
      );
      await transaction.rollback();
      res.setHeader("Retry-After", String(segundos));
      return res
        .status(429)
        .json({
          message:
            "Demasiados intentos incorrectos. Esperá a que termine el bloqueo temporal para volver a ingresar.",
          retry_after_segundos: segundos,
        });
    }
    let intentos = usuario.intentos_fallidos;
    if (
      usuario.bloqueado_hasta ||
      !usuario.ultimo_intento_fallido ||
      ahora.getTime() - usuario.ultimo_intento_fallido.getTime() >= 15 * 60000
    ) {
      intentos = 0;
    }
    if (!(await compararPassword(password, usuario.password_hash))) {
      intentos++;
      let bloqueado_hasta = null;
      if (intentos >= 5)
        bloqueado_hasta = new Date(ahora.getTime() + 15 * 60000);
      await usuario.update(
        {
          intentos_fallidos: intentos,
          ultimo_intento_fallido: ahora,
          bloqueado_hasta,
        },
        { transaction },
      );
      await transaction.commit();
      if (bloqueado_hasta) {
        res.setHeader("Retry-After", "900");
        return res
          .status(429)
          .json({
            message:
              "Se alcanzaron 5 intentos incorrectos. El inicio de sesión queda bloqueado durante 15 minutos.",
            retry_after_segundos: 900,
          });
      }
      return res
        .status(401)
        .json({ message: "Correo o contraseña incorrectos." });
    }
    await usuario.update(
      {
        ultima_conexion: ahora,
        intentos_fallidos: 0,
        ultimo_intento_fallido: null,
        bloqueado_hasta: null,
      },
      { transaction },
    );
    await abrirSesion(usuario, res, transaction);
    await registrarEvento(usuario.id, "CU002_LOGIN", "cuentas", transaction);
    await transaction.commit();
    await cargarRoles(usuario);
    res.json({ user: datosPublicos(usuario) });
  } catch (error) {
    if (transaction && !transaction.finished) await transaction.rollback();
    res.status(500).json({ message: "No se pudo iniciar sesión." });
  }
}
async function cerrarSesion(req, res) {
  try {
    if (req.body.confirmar !== true) {
      return res.status(400).json({
        message: "Confirmá el cierre de sesión.",
      });
    }
    await Sesion.destroy({
      where: {
        usuario_id: req.user.id,
        token_hash: hashToken(req.cookies.gymos100),
      },
    });
    res.clearCookie("gymos100", {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
    });
    res.status(204).end();
  } catch (error) {
    res.status(500).json({
      message: "No se pudo cerrar la sesión.",
    });
  }
}
function verCuenta(req, res) {
  res.json({
    user: datosPublicos(req.user),
  });
}
async function actualizarDatos(req, res) {
  try {
    const {
      nombre,
      apellido,
      telefono,
      genero,
      fecha_nacimiento,
      zona_horaria,
      consentimiento_ia,
    } = req.body;
    if (
      typeof nombre !== "string" ||
      nombre.trim().length < 2 ||
      nombre.length > 100 ||
      typeof apellido !== "string" ||
      apellido.length > 100 ||
      typeof telefono !== "string" ||
      telefono.length > 40 ||
      !["masculino", "femenino", "otro"].includes(genero) ||
      typeof consentimiento_ia !== "boolean" ||
      typeof zona_horaria !== "string" ||
      zona_horaria.length > 80
    ) {
      return res.status(400).json({
        message: "Revisá los datos del perfil.",
      });
    }
    if (
      fecha_nacimiento &&
      (!/^\d{4}-\d{2}-\d{2}$/.test(fecha_nacimiento) ||
        !Number.isFinite(Date.parse(fecha_nacimiento)) ||
        new Date(fecha_nacimiento).toISOString().slice(0, 10) !==
          fecha_nacimiento ||
        new Date(fecha_nacimiento) > new Date())
    ) {
      return res.status(400).json({
        message: "La fecha de nacimiento no es válida.",
      });
    }
    try {
      new Intl.DateTimeFormat("es", {
        timeZone: zona_horaria,
      }).format();
    } catch (error) {
      return res.status(400).json({
        message: "La zona horaria no es válida.",
      });
    }
    await req.user.update({
      nombre: nombre.trim(),
      apellido,
      telefono_cifrado: encriptarRreversible(telefono),
      genero,
      fecha_nacimiento: fecha_nacimiento || null,
      zona_horaria,
      consentimiento_ia,
    });
    await registrarEvento(req.user.id, "CU005_PERFIL", "cuentas");
    res.json({
      user: datosPublicos(req.user),
    });
  } catch (error) {
    res.status(500).json({
      message: "No se pudo guardar el perfil.",
    });
  }
}
async function eliminarCuenta(req, res) {
  try {
    if (
      req.body.confirmar !== true ||
      typeof req.body.password !== "string" ||
      !(await compararPassword(req.body.password, req.user.password_hash))
    ) {
      return res.status(403).json({
        message: "Confirmá la eliminación con tu contraseña actual.",
      });
    }
    if (req.user.administrador) {
      return res.status(409).json({
        message:
          "Una cuenta administradora debe ser eliminada desde el panel por otro administrador.",
      });
    }
    const transaction = await sequelize.transaction();
    try {
      await registrarEvento(
        null,
        "CU006_ELIMINAR_CUENTA",
        "cuentas",
        transaction,
      );
      await req.user.destroy({
        transaction,
      });
      await transaction.commit();
    } catch (errorGuardado) {
      await transaction.rollback();
      throw errorGuardado;
    }
    res.clearCookie("gymos100", {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
    });
    res.status(204).end();
  } catch (error) {
    res.status(500).json({
      message: "No se pudo eliminar la cuenta.",
    });
  }
}
async function cambiarPassword(req, res) {
  const { actual, nueva } = req.body;
  if (
    typeof actual !== "string" ||
    Buffer.byteLength(actual) > 72 ||
    typeof nueva !== "string" ||
    nueva.length < 10 ||
    Buffer.byteLength(nueva) > 72
  ) {
    return res.status(400).json({
      message:
        "Revisá la contraseña actual y la nueva (10 caracteres como mínimo y hasta 72 bytes).",
    });
  }
  let transaction;
  try {
    transaction = await sequelize.transaction();
    const usuario = await Usuario.findByPk(req.user.id, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!usuario || !(await compararPassword(actual, usuario.password_hash))) {
      await transaction.rollback();
      return res
        .status(403)
        .json({ message: "La contraseña actual no coincide." });
    }
    await usuario.update(
      {
        password_hash: await encriptarIrreversible(nueva),
        intentos_fallidos: 0,
        ultimo_intento_fallido: null,
        bloqueado_hasta: null,
      },
      { transaction },
    );
    await Sesion.destroy({ where: { usuario_id: usuario.id }, transaction });
    await require("../models").Recuperacion.destroy({
      where: { usuario_id: usuario.id },
      transaction,
    });
    await registrarEvento(
      usuario.id,
      "CAMBIO_PASSWORD",
      "cuentas",
      transaction,
    );
    await transaction.commit();
    res.clearCookie("gymos100", { path: "/", httpOnly: true, sameSite: "lax" });
    res.json({ message: "Contraseña actualizada. Volvé a iniciar sesión." });
  } catch (error) {
    if (transaction && !transaction.finished) await transaction.rollback();
    res.status(500).json({ message: "No se pudo cambiar la contraseña." });
  }
}
module.exports = {
  cambiarPassword,
  registrarUsuario,
  iniciarSesion,
  cerrarSesion,
  verCuenta,
  actualizarDatos,
  eliminarCuenta,
  datosPublicos,
  cargarRoles,
};
