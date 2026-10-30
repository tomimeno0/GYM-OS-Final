const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Rutina = sequelize.define(
  "Rutina",
  {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    dvh: { type: DataTypes.STRING(64), allowNull: false, defaultValue: "" },
    usuario_id: { type: DataTypes.UUID, allowNull: false },
    objetivo_id: { type: DataTypes.UUID, allowNull: true },
    nombre: { type: DataTypes.STRING(100), allowNull: false },
    descripcion: { type: DataTypes.TEXT },
    tipo_generacion: {
      type: DataTypes.ENUM("manual", "ia"),
      allowNull: false,
      defaultValue: "manual",
    },
    estado: {
      type: DataTypes.ENUM("activa", "eliminada", "finalizada"),
      allowNull: false,
      defaultValue: "activa",
    },
    fecha_creacion: { type: DataTypes.DATE(3), allowNull: false },
    fecha_actualizacion: { type: DataTypes.DATE(3), allowNull: true },
  },
  { tableName: "rutinas", timestamps: false },
);

module.exports = Rutina;
