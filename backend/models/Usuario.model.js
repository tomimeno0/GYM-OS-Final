const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Usuario = sequelize.define(
  "Usuario",
  {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    dvh: { type: DataTypes.STRING(64), allowNull: false, defaultValue: "" },
    nombre: { type: DataTypes.STRING(100), allowNull: false },
    apellido: { type: DataTypes.STRING(100), allowNull: true },
    email: { type: DataTypes.STRING(150), allowNull: false, unique: true },
    password_hash: { type: DataTypes.STRING(255), allowNull: false },
    telefono_cifrado: { type: DataTypes.STRING(255), allowNull: true },
    fecha_nacimiento: { type: DataTypes.DATEONLY, allowNull: true },
    genero: {
      type: DataTypes.ENUM("masculino", "femenino", "otro"),
      allowNull: false,
      defaultValue: "otro",
    },
    estado: {
      type: DataTypes.ENUM("activo", "bloqueado", "eliminado"),
      allowNull: false,
      defaultValue: "activo",
    },
    fecha_registro: { type: DataTypes.DATE(3), allowNull: false },
    ultima_conexion: { type: DataTypes.DATE(3), allowNull: true },
    zona_horaria: {
      type: DataTypes.STRING(80),
      allowNull: false,
      defaultValue: "America/Argentina/Buenos_Aires",
    },
    consentimiento_ia: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  { tableName: "usuarios", timestamps: false },
);

module.exports = Usuario;
