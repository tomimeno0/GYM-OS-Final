const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Entrenamiento = sequelize.define(
  "Entrenamiento",
  {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    dvh: { type: DataTypes.STRING(64), allowNull: false, defaultValue: "" },
    usuario_id: { type: DataTypes.UUID, allowNull: false },
    rutina_id: { type: DataTypes.UUID, allowNull: false },
    fecha: { type: DataTypes.DATEONLY, allowNull: false },
    fecha_inicio: { type: DataTypes.DATE(3), allowNull: false },
    fecha_fin: { type: DataTypes.DATE(3), allowNull: true },
    dia_semana: { type: DataTypes.STRING(20), allowNull: true },
    estado: {
      type: DataTypes.ENUM("iniciado", "completado", "incompleto", "cancelado"),
      allowNull: false,
      defaultValue: "iniciado",
    },
    observaciones: { type: DataTypes.TEXT },
    usuario_en_curso: {
      type: DataTypes.STRING(36),
      allowNull: true,
      unique: true,
    },
    distancia_km: { type: DataTypes.DECIMAL(6, 2), allowNull: true },
  },
  { tableName: "entrenamientos", timestamps: false },
);

module.exports = Entrenamiento;
