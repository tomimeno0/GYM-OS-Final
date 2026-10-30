const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const EntrenamientoEjercicio = sequelize.define(
  "EntrenamientoEjercicio",
  {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    dvh: { type: DataTypes.STRING(64), allowNull: false, defaultValue: "" },
    entrenamiento_id: { type: DataTypes.UUID, allowNull: false },
    nombre_ejercicio: { type: DataTypes.STRING(150), allowNull: false },
    ejercicio_id: { type: DataTypes.STRING(40), allowNull: true },
    orden: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    series: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    repeticiones: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    peso_utilizado_kg: { type: DataTypes.DECIMAL(6, 2), allowNull: true },
    realizado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    observaciones: { type: DataTypes.TEXT },
  },
  { tableName: "entrenamiento_ejercicios", timestamps: false },
);

module.exports = EntrenamientoEjercicio;
