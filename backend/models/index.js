const Recuperacion = require("./Recuperacion.model");
const Usuario = require("./Usuario.model");
const Rol = require("./Rol.model");
const UsuarioRol = require("./UsuarioRol.model");
const MedicionFisica = require("./MedicionFisica.model");
const Objetivo = require("./Objetivo.model");
const Rutina = require("./Rutina.model");
const RutinaEjercicio = require("./RutinaEjercicio.model");
const Entrenamiento = require("./Entrenamiento.model");
const EntrenamientoEjercicio = require("./EntrenamientoEjercicio.model");
const Dieta = require("./Dieta.model");
const DietaComida = require("./DietaComida.model");
const ComidaConsumida = require("./ComidaConsumida.model");
const Sesion = require("./Sesion.model");
const Conversacion = require("./Conversacion.model");
const Mensaje = require("./Mensaje.model");
const Bitacora = require("./Bitacora.model");

Usuario.belongsToMany(Rol, {
  through: UsuarioRol,
  foreignKey: "usuario_id",
  otherKey: "rol_id",
  as: "roles",
});
Rol.belongsToMany(Usuario, {
  through: UsuarioRol,
  foreignKey: "rol_id",
  otherKey: "usuario_id",
});
Usuario.hasMany(MedicionFisica, {
  foreignKey: "usuario_id",
  onDelete: "CASCADE",
});
MedicionFisica.belongsTo(Usuario, { foreignKey: "usuario_id" });
Usuario.hasMany(Objetivo, { foreignKey: "usuario_id", onDelete: "CASCADE" });
Objetivo.belongsTo(Usuario, { foreignKey: "usuario_id" });
Objetivo.belongsTo(MedicionFisica, {
  foreignKey: "medicion_inicio_id",
  onDelete: "SET NULL",
});
Usuario.hasMany(Rutina, { foreignKey: "usuario_id", onDelete: "CASCADE" });
Rutina.belongsTo(Usuario, { foreignKey: "usuario_id" });
Rutina.belongsTo(Objetivo, { foreignKey: "objetivo_id", onDelete: "SET NULL" });
Rutina.hasMany(RutinaEjercicio, {
  foreignKey: "rutina_id",
  as: "ejercicios",
  onDelete: "CASCADE",
});
RutinaEjercicio.belongsTo(Rutina, { foreignKey: "rutina_id" });
Usuario.hasMany(Entrenamiento, {
  foreignKey: "usuario_id",
  onDelete: "CASCADE",
});
Entrenamiento.belongsTo(Usuario, { foreignKey: "usuario_id" });
Entrenamiento.belongsTo(Rutina, {
  foreignKey: "rutina_id",
  onDelete: "CASCADE",
});
Entrenamiento.hasMany(EntrenamientoEjercicio, {
  foreignKey: "entrenamiento_id",
  as: "ejercicios",
  onDelete: "CASCADE",
});
EntrenamientoEjercicio.belongsTo(Entrenamiento, {
  foreignKey: "entrenamiento_id",
});
Usuario.hasMany(Dieta, { foreignKey: "usuario_id", onDelete: "CASCADE" });
Dieta.belongsTo(Usuario, { foreignKey: "usuario_id" });
Dieta.belongsTo(Objetivo, { foreignKey: "objetivo_id", onDelete: "SET NULL" });
Dieta.hasMany(DietaComida, {
  foreignKey: "dieta_id",
  as: "comidas",
  onDelete: "CASCADE",
});
DietaComida.belongsTo(Dieta, { foreignKey: "dieta_id" });
Usuario.hasMany(ComidaConsumida, {
  foreignKey: "usuario_id",
  onDelete: "CASCADE",
});
ComidaConsumida.belongsTo(Usuario, { foreignKey: "usuario_id" });
Usuario.hasMany(Sesion, { foreignKey: "usuario_id", onDelete: "CASCADE" });
Sesion.belongsTo(Usuario, { foreignKey: "usuario_id" });
Usuario.hasMany(Conversacion, {
  foreignKey: "usuario_id",
  onDelete: "CASCADE",
});
Conversacion.belongsTo(Usuario, { foreignKey: "usuario_id" });
Conversacion.hasMany(Mensaje, {
  foreignKey: "conversacion_id",
  as: "mensajes",
  onDelete: "CASCADE",
});
Mensaje.belongsTo(Conversacion, { foreignKey: "conversacion_id" });
Bitacora.belongsTo(Usuario, { foreignKey: "usuario_id", onDelete: "SET NULL" });

Usuario.hasMany(Recuperacion, {
  foreignKey: "usuario_id",
  onDelete: "CASCADE",
});
Recuperacion.belongsTo(Usuario, { foreignKey: "usuario_id" });

module.exports = {
  Recuperacion,
  Usuario,
  Rol,
  UsuarioRol,
  MedicionFisica,
  Objetivo,
  Rutina,
  RutinaEjercicio,
  Entrenamiento,
  EntrenamientoEjercicio,
  Dieta,
  DietaComida,
  ComidaConsumida,
  Sesion,
  Conversacion,
  Mensaje,
  Bitacora,
};
