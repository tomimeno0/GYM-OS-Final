const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Mensaje = sequelize.define(
  "Mensaje",
  {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    dvh: { type: DataTypes.STRING(64), allowNull: false, defaultValue: "" },
    conversacion_id: { type: DataTypes.UUID, allowNull: false },
    rol: {
      type: DataTypes.ENUM("user", "assistant"),
      allowNull: false,
      defaultValue: "user",
    },
    contenido: { type: DataTypes.TEXT, allowNull: false },
    fecha_creacion: { type: DataTypes.DATE(3), allowNull: false },
  },
  { tableName: "mensajes", timestamps: false },
);

module.exports = Mensaje;
