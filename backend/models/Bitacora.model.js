const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Bitacora = sequelize.define(
  "Bitacora",
  {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    dvh: { type: DataTypes.STRING(64), allowNull: false, defaultValue: "" },
    usuario_id: { type: DataTypes.UUID, allowNull: true },
    accion: { type: DataTypes.STRING(100), allowNull: false },
    modulo: { type: DataTypes.STRING(100), allowNull: false },
    descripcion: { type: DataTypes.TEXT },
    fecha_hora: { type: DataTypes.DATE(3), allowNull: false },
    resultado: {
      type: DataTypes.ENUM("exitoso", "fallido", "advertencia"),
      allowNull: false,
      defaultValue: "exitoso",
    },
  },
  { tableName: "bitacora", timestamps: false },
);

module.exports = Bitacora;
