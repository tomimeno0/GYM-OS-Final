const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Rol = sequelize.define(
  "Rol",
  {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    dvh: { type: DataTypes.STRING(64), allowNull: false, defaultValue: "" },
    nombre: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    descripcion: { type: DataTypes.STRING(255), allowNull: true },
    fecha_creacion: { type: DataTypes.DATE(3), allowNull: false },
    permisos: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
    sistema: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  },
  { tableName: "roles", timestamps: false },
);

module.exports = Rol;
