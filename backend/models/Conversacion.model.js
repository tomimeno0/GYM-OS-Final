const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Conversacion = sequelize.define(
  "Conversacion",
  {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    dvh: { type: DataTypes.STRING(64), allowNull: false, defaultValue: "" },
    usuario_id: { type: DataTypes.UUID, allowNull: false },
    modo: {
      type: DataTypes.ENUM("entrenador", "soporte"),
      allowNull: false,
      defaultValue: "entrenador",
    },
    titulo: { type: DataTypes.STRING(100), allowNull: true },
    fecha_creacion: { type: DataTypes.DATE(3), allowNull: false },
  },
  { tableName: "conversaciones", timestamps: false },
);

module.exports = Conversacion;
