const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const Recuperacion = sequelize.define(
  "Recuperacion",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    usuario_id: { type: DataTypes.UUID, allowNull: false, unique: true },
    token_hash: { type: DataTypes.STRING(64), allowNull: false, unique: true },
    fecha_expiracion: { type: DataTypes.DATE(3), allowNull: false },
  },
  { tableName: "recuperaciones", timestamps: false },
);
module.exports = Recuperacion;
