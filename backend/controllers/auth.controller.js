const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const { Usuario, Sesion } = require("../models");
const { hashToken } = require("./seguridad.controller");
async function verificarSesion(req, res, next) {
  try {
    const token = req.cookies.gymos100;
    if (!token) {
      return res.status(401).json({
        message: "Iniciá sesión para continuar.",
      });
    }
    const datos = jwt.verify(token, process.env.JWT_SECRET);
    const sesion = await Sesion.findOne({
      where: {
        token_hash: hashToken(token),
        usuario_id: datos.id,
        fecha_expiracion: {
          [Op.gt]: new Date(),
        },
      },
    });
    if (!sesion) {
      return res.status(401).json({
        message: "La sesión venció o se cerró.",
      });
    }
    const usuario = await Usuario.findByPk(datos.id);
    if (!usuario || usuario.estado !== "activo") {
      return res.status(401).json({
        message: "La cuenta no está habilitada.",
      });
    }
    await require("./usuarios.controller").cargarRoles(usuario);
    req.user = usuario;
    next();
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({
        message: "La sesión no es válida. Volvé a ingresar.",
      });
    }
    res.status(500).json({
      message: "No se pudo comprobar la sesión.",
    });
  }
}
function verificarAdmin(req, res, next) {
  if (!req.user.administrador)
    return res.status(403).json({ message: "Solo administradores." });
  next();
}
function verificarPermiso(permiso) {
  return function (req, res, next) {
    if (req.user.administrador || req.user.permisos.includes(permiso))
      return next();
    res.status(403).json({ message: "No tenés permiso para esta operación." });
  };
}
module.exports = {
  verificarPermiso,
  verificarAdmin,
  verificarSesion,
};
