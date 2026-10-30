const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Sesion = sequelize.define(
  "Sesion",
  {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    dvh: { type: DataTypes.STRING(64), allowNull: false, defaultValue: "" },
    usuario_id: { type: DataTypes.UUID, allowNull: false },
    token_hash: { type: DataTypes.STRING(64), allowNull: false, unique: true },
    fecha_creacion: { type: DataTypes.DATE(3), allowNull: false },
    fecha_expiracion: { type: DataTypes.DATE(3), allowNull: false },
  },
  { tableName: "sesiones", timestamps: false },
);

module.exports = Sesion;
