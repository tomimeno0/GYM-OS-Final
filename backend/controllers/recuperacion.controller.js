const nodemailer = require("nodemailer");
const { sequelize } = require("../config/db");
const { Usuario, Sesion, Recuperacion } = require("../models");
const {
  tokenNuevo,
  hashToken,
  encriptarIrreversible,
} = require("./seguridad.controller");
async function recuperarPassword(req, res) {
  const email = req.body.email;
  if (
    typeof email !== "string" ||
    email.length > 150 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    return res.status(400).json({ message: "Ingresá un correo válido." });
  }
  if (
    !process.env.SMTP_HOST ||
    !process.env.SMTP_FROM ||
    !process.env.APP_URL
  ) {
    return res.status(503).json({
      message: "La recuperación por correo todavía no está configurada.",
    });
  }
  try {
    const usuario = await Usuario.findOne({
      where: { email: email.trim().toLowerCase(), estado: "activo" },
    });
    if (usuario) {
      const token = tokenNuevo();
      const huella = hashToken(token);
      await Recuperacion.upsert({
        usuario_id: usuario.id,
        token_hash: huella,
        fecha_expiracion: new Date(Date.now() + 15 * 60000),
      });
      const opciones = {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === "true",
        connectionTimeout: 10000,
        socketTimeout: 15000,
      };
      if (process.env.SMTP_USER) {
        opciones.auth = {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        };
      }
      const correo = nodemailer.createTransport(opciones);
      const enlace =
        process.env.APP_URL.replace(/\/$/, "") + "/restablecer#" + token;
      try {
        await correo.sendMail({
          from: process.env.SMTP_FROM,
          to: usuario.email,
          subject: "GYM-OS · Recuperar contraseña",
          text:
            "Para elegir una nueva contraseña, abrí este enlace: " +
            enlace +
            "\nVence en 15 minutos y puede usarse una sola vez. Si no lo pediste, ignorá este mensaje.",
        });
      } catch (errorCorreo) {
        await Recuperacion.destroy({ where: { token_hash: huella } });
        throw errorCorreo;
      }
    }
    res.json({
      message:
        "Si el correo corresponde a una cuenta activa, recibirás un enlace para recuperar tu contraseña.",
    });
  } catch (error) {
    res.status(503).json({
      message: "No se pudo enviar el correo. Intentá nuevamente más tarde.",
    });
  }
}
async function restablecerPassword(req, res) {
  const { token, password } = req.body;
  if (
    typeof token !== "string" ||
    !/^[a-f0-9]{64}$/.test(token) ||
    typeof password !== "string" ||
    password.length < 10 ||
    Buffer.byteLength(password) > 72
  ) {
    return res.status(400).json({
      message:
        "Revisá el enlace y la contraseña: mínimo 10 caracteres y máximo 72 bytes.",
    });
  }
  let transaction;
  try {
    const password_hash = await encriptarIrreversible(password);
    transaction = await sequelize.transaction();
    const recuperacion = await Recuperacion.findOne({
      where: { token_hash: hashToken(token) },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!recuperacion || recuperacion.fecha_expiracion <= new Date()) {
      await transaction.rollback();
      return res.status(400).json({
        message: "El enlace venció o ya fue utilizado. Pedí uno nuevo.",
      });
    }
    const usuario = await Usuario.findOne({
      where: { id: recuperacion.usuario_id, estado: "activo" },
      transaction,
    });
    if (!usuario) {
      await transaction.rollback();
      return res.status(400).json({ message: "El enlace no es válido." });
    }
    await usuario.update(
      {
        password_hash,
        intentos_fallidos: 0,
        ultimo_intento_fallido: null,
        bloqueado_hasta: null,
      },
      { transaction },
    );
    await Sesion.destroy({ where: { usuario_id: usuario.id }, transaction });
    await recuperacion.destroy({ transaction });
    await transaction.commit();
    res.clearCookie("gymos100", { path: "/", httpOnly: true, sameSite: "lax" });
    res.json({
      message: "Contraseña actualizada. Iniciá sesión con la nueva contraseña.",
    });
  } catch (error) {
    if (transaction && !transaction.finished) {
      await transaction.rollback();
    }
    res.status(500).json({ message: "No se pudo actualizar la contraseña." });
  }
}
module.exports = { recuperarPassword, restablecerPassword };
