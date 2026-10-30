const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const RutinaEjercicio = sequelize.define(
  "RutinaEjercicio",
  {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    dvh: { type: DataTypes.STRING(64), allowNull: false, defaultValue: "" },
    rutina_id: { type: DataTypes.UUID, allowNull: false },
    ejercicio_id: { type: DataTypes.STRING(40), allowNull: true },
    nombre_ejercicio: { type: DataTypes.STRING(150), allowNull: false },
    grupo_muscular: { type: DataTypes.STRING(100), allowNull: true },
    dia_semana: { type: DataTypes.STRING(20), allowNull: true },
    orden: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    series: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 3 },
    repeticiones: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10,
    },
    peso_sugerido_kg: { type: DataTypes.DECIMAL(6, 2), allowNull: true },
    descanso_segundos: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 90,
    },
    observaciones: { type: DataTypes.TEXT },
  },
  { tableName: "rutina_ejercicios", timestamps: false },
);

module.exports = RutinaEjercicio;
