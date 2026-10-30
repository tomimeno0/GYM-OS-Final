const { Op } = require("sequelize");
const { sequelize } = require("../config/db");
const { Usuario, Rol, UsuarioRol, Sesion, Bitacora } = require("../models");
const { encriptarIrreversible } = require("./seguridad.controller");
const { registrarEvento } = require("./bitacora.controller");
const permisosValidos = [
  "usuarios:ver",
  "usuarios:editar",
  "roles:gestionar",
  "auditoria:ver",
];
function usuarioPublico(usuario) {
  return {
    id: usuario.id,
    nombre: usuario.nombre,
    apellido: usuario.apellido,
    email: usuario.email,
    estado: usuario.estado,
    roles: usuario.roles,
  };
}
async function listarUsuarios(req, res) {
  try {
    const q = String(req.query.q || "").slice(0, 100);
    const usuarios = await Usuario.findAll({
      where: {
        [Op.or]: [
          { nombre: { [Op.like]: "%" + q + "%" } },
          { email: { [Op.like]: "%" + q + "%" } },
        ],
      },
      include: { model: Rol, as: "roles", through: { attributes: [] } },
      order: [["nombre", "ASC"]],
      limit: 200,
    });
    const items = [];
    for (let i = 0; i < usuarios.length; i++)
      items.push(usuarioPublico(usuarios[i]));
    res.json({ items });
  } catch (error) {
    res.status(500).json({ message: "No se pudieron consultar los usuarios." });
  }
}
async function crearUsuario(req, res) {
  const { nombre, apellido, email, password } = req.body;
  if (
    typeof nombre !== "string" ||
    nombre.trim().length < 2 ||
    nombre.length > 100 ||
    typeof apellido !== "string" ||
    apellido.length > 100 ||
    typeof email !== "string" ||
    email.length > 150 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    typeof password !== "string" ||
    password.length < 10 ||
    Buffer.byteLength(password) > 72
  )
    return res
      .status(400)
      .json({
        message: "Revisá los datos y la contraseña (mínimo 10 caracteres).",
      });
  const transaction = await sequelize.transaction();
  try {
    const usuario = await Usuario.create(
      {
        nombre: nombre.trim(),
        apellido,
        email: email.trim().toLowerCase(),
        password_hash: await encriptarIrreversible(password),
        fecha_registro: new Date(),
      },
      { transaction },
    );
    const rol = await Rol.findOne({
      where: { nombre: "Cliente" },
      transaction,
    });
    await UsuarioRol.create(
      { usuario_id: usuario.id, rol_id: rol.id, fecha_asignacion: new Date() },
      { transaction },
    );
    await registrarEvento(
      req.user.id,
      "ADMIN_CREAR_USUARIO",
      "administracion",
      transaction,
    );
    await transaction.commit();
    res.status(201).json({ id: usuario.id });
  } catch (error) {
    await transaction.rollback();
    if (error.name === "SequelizeUniqueConstraintError")
      return res
        .status(409)
        .json({ message: "Ese correo ya está registrado." });
    res.status(500).json({ message: "No se pudo crear el usuario." });
  }
}
async function editarUsuario(req, res) {
  const { nombre, apellido, email } = req.body;
  if (
    typeof nombre !== "string" ||
    nombre.trim().length < 2 ||
    nombre.length > 100 ||
    typeof apellido !== "string" ||
    apellido.length > 100 ||
    typeof email !== "string" ||
    email.length > 150 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  )
    return res
      .status(400)
      .json({ message: "Revisá nombre, apellido y correo." });
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario)
      return res.status(404).json({ message: "Usuario no encontrado." });
    await usuario.update({
      nombre: nombre.trim(),
      apellido,
      email: email.trim().toLowerCase(),
    });
    res.json({ id: usuario.id });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError")
      return res
        .status(409)
        .json({ message: "Ese correo ya está registrado." });
    res.status(500).json({ message: "No se pudo editar el usuario." });
  }
}
async function protegerAdministrador(usuario, transaction) {
  const rol = await Rol.findOne({
    where: { nombre: "Administrador" },
    transaction,
    lock: transaction.LOCK.UPDATE,
  });
  const asignacion = await UsuarioRol.findOne({
    where: { usuario_id: usuario.id, rol_id: rol.id },
    transaction,
  });
  if (!asignacion || usuario.estado !== "activo") return;
  const activos = await Usuario.count({
    where: { estado: "activo" },
    include: { model: Rol, as: "roles", where: { id: rol.id } },
    transaction,
  });
  if (activos <= 1)
    throw Error("No se puede dejar el sistema sin administrador activo.");
}
async function cambiarEstado(req, res) {
  if (
    req.body.confirmar !== true ||
    !["activo", "bloqueado"].includes(req.body.estado)
  )
    return res
      .status(400)
      .json({ message: "Elegí estado y confirmá el cambio." });
  const transaction = await sequelize.transaction();
  try {
    const usuario = await Usuario.findByPk(req.params.id, { transaction });
    if (!usuario) {
      await transaction.rollback();
      return res.status(404).json({ message: "Usuario no encontrado." });
    }
    if (req.body.estado === "bloqueado")
      await protegerAdministrador(usuario, transaction);
    await usuario.update({ estado: req.body.estado }, { transaction });
    if (req.body.estado === "bloqueado")
      await Sesion.destroy({ where: { usuario_id: usuario.id }, transaction });
    await registrarEvento(
      req.user.id,
      "ADMIN_ESTADO_USUARIO",
      "administracion",
      transaction,
    );
    await transaction.commit();
    res.json({ id: usuario.id, estado: usuario.estado });
  } catch (error) {
    await transaction.rollback();
    res.status(409).json({ message: error.message });
  }
}
async function eliminarUsuario(req, res) {
  if (req.body.confirmar !== true)
    return res.status(400).json({ message: "Confirmá la eliminación." });
  if (req.params.id === req.user.id)
    return res
      .status(409)
      .json({ message: "Pedí a otro administrador que elimine tu cuenta." });
  const transaction = await sequelize.transaction();
  try {
    const usuario = await Usuario.findByPk(req.params.id, { transaction });
    if (!usuario) {
      await transaction.rollback();
      return res.status(404).json({ message: "Usuario no encontrado." });
    }
    await protegerAdministrador(usuario, transaction);
    await usuario.destroy({ transaction });
    await registrarEvento(
      req.user.id,
      "ADMIN_ELIMINAR_USUARIO",
      "administracion",
      transaction,
    );
    await transaction.commit();
    res.status(204).end();
  } catch (error) {
    await transaction.rollback();
    res
      .status(409)
      .json({
        message:
          "No se pudo eliminar. Verificá que quede otro administrador activo.",
      });
  }
}
async function listarRoles(req, res) {
  try {
    res.json({
      items: await Rol.findAll({ order: [["nombre", "ASC"]] }),
      permisos: permisosValidos,
    });
  } catch (error) {
    res.status(500).json({ message: "No se pudieron consultar los roles." });
  }
}
async function crearRoles(req, res) {
  const { nombre, descripcion, permisos } = req.body;
  if (
    typeof nombre !== "string" ||
    nombre.trim().length < 2 ||
    nombre.length > 50 ||
    typeof descripcion !== "string" ||
    descripcion.length > 255 ||
    !Array.isArray(permisos) ||
    permisos.length > 4
  )
    return res
      .status(400)
      .json({ message: "Revisá el nombre, descripción y permisos." });
  for (let i = 0; i < permisos.length; i++)
    if (!permisosValidos.includes(permisos[i]))
      return res.status(400).json({ message: "Permiso inválido." });
  try {
    let rol;
    if (req.params.id) {
      rol = await Rol.findByPk(req.params.id);
      if (!rol) return res.status(404).json({ message: "Rol no encontrado." });
      if (rol.sistema)
        return res
          .status(409)
          .json({ message: "Los roles del sistema están protegidos." });
      await rol.update({ nombre: nombre.trim(), descripcion, permisos });
    } else {
      rol = await Rol.create({
        nombre: nombre.trim(),
        descripcion,
        permisos,
        fecha_creacion: new Date(),
      });
    }
    let codigo = 201;
    if (req.params.id) codigo = 200;
    res.status(codigo).json(rol);
  } catch (error) {
    res
      .status(409)
      .json({ message: "No se pudo guardar. Revisá si el nombre ya existe." });
  }
}
async function asignarRoles(req, res) {
  const roles = req.body.roles;
  if (
    req.body.confirmar !== true ||
    !Array.isArray(roles) ||
    !roles.length ||
    roles.length > 20
  )
    return res.status(400).json({ message: "Seleccioná roles y confirmá." });
  for (let i = 0; i < roles.length; i++)
    if (typeof roles[i] !== "string" || roles.indexOf(roles[i]) !== i)
      return res.status(400).json({ message: "Roles inválidos o repetidos." });
  const transaction = await sequelize.transaction();
  try {
    const administrador = await Rol.findOne({
      where: { nombre: "Administrador" },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    const usuario = await Usuario.findByPk(req.params.id, { transaction });
    if (!usuario) {
      await transaction.rollback();
      return res.status(404).json({ message: "Usuario no encontrado." });
    }
    if (!roles.includes(administrador.id))
      await protegerAdministrador(usuario, transaction);
    for (let i = 0; i < roles.length; i++)
      if (!(await Rol.findByPk(roles[i], { transaction })))
        throw Error("Rol no encontrado.");
    await UsuarioRol.destroy({
      where: { usuario_id: usuario.id },
      transaction,
    });
    for (let i = 0; i < roles.length; i++)
      await UsuarioRol.create(
        {
          usuario_id: usuario.id,
          rol_id: roles[i],
          fecha_asignacion: new Date(),
        },
        { transaction },
      );
    await Sesion.destroy({ where: { usuario_id: usuario.id }, transaction });
    await registrarEvento(
      req.user.id,
      "ADMIN_ASIGNAR_ROLES",
      "administracion",
      transaction,
    );
    await transaction.commit();
    res.json({
      message: "Roles actualizados. Las sesiones de esa cuenta se cerraron.",
    });
  } catch (error) {
    await transaction.rollback();
    res
      .status(409)
      .json({
        message:
          "No se pudo asignar: revisá los roles y que quede un administrador activo.",
      });
  }
}
async function eliminarRol(req, res) {
  if (req.body.confirmar !== true)
    return res
      .status(400)
      .json({ message: "Confirmá la eliminación del rol." });
  const transaction = await sequelize.transaction();
  try {
    const rol = await Rol.findByPk(req.params.id, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!rol) {
      await transaction.rollback();
      return res.status(404).json({ message: "Rol no encontrado." });
    }
    if (
      rol.sistema ||
      (await UsuarioRol.count({ where: { rol_id: rol.id }, transaction }))
    ) {
      await transaction.rollback();
      return res
        .status(409)
        .json({
          message: "No se puede borrar un rol del sistema o que está asignado.",
        });
    }
    await rol.destroy({ transaction });
    await transaction.commit();
    res.status(204).end();
  } catch (error) {
    await transaction.rollback();
    res.status(409).json({ message: "No se pudo eliminar el rol." });
  }
}
async function verBitacora(req, res) {
  try {
    res.json({
      items: await Bitacora.findAll({
        order: [["fecha_hora", "DESC"]],
        limit: 100,
      }),
    });
  } catch (error) {
    res.status(500).json({ message: "No se pudo consultar la bitácora." });
  }
}
async function modificarRoles(req, res) {
  return crearRoles(req, res);
}
async function bloquearUsuario(req, res) {
  req.body.estado = "bloqueado";
  return cambiarEstado(req, res);
}
async function activarUsuario(req, res) {
  req.body.estado = "activo";
  return cambiarEstado(req, res);
}
module.exports = {
  crearRoles,
  modificarRoles,
  bloquearUsuario,
  activarUsuario,
  listarUsuarios,
  crearUsuario,
  editarUsuario,
  cambiarEstado,
  eliminarUsuario,
  listarRoles,
  asignarRoles,
  eliminarRol,
  verBitacora,
};
