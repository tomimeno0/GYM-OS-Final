const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Objetivo = sequelize.define(
  "Objetivo",
  {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    dvh: { type: DataTypes.STRING(64), allowNull: false, defaultValue: "" },
    usuario_id: { type: DataTypes.UUID, allowNull: false },
    medicion_inicio_id: { type: DataTypes.UUID, allowNull: true },
    nombre: { type: DataTypes.STRING(100), allowNull: false },
    descripcion: { type: DataTypes.TEXT },
    tipo: {
      type: DataTypes.ENUM(
        "bajar_peso",
        "ganar_masa_muscular",
        "mejorar_resistencia",
        "aumentar_frecuencia_entrenamiento",
        "definir",
        "mantener_peso",
      ),
      allowNull: false,
      defaultValue: "mantener_peso",
    },
    valor_objetivo: { type: DataTypes.DECIMAL(8, 2), allowNull: true },
    unidad: { type: DataTypes.STRING(30), allowNull: true },
    actividad_objetivo: { type: DataTypes.STRING(50), allowNull: true },
    frecuencia_semanal: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 3,
    },
    peso_inicial: { type: DataTypes.DECIMAL(8, 2), allowNull: true },
    estado: {
      type: DataTypes.ENUM("activo", "completado", "eliminado"),
      allowNull: false,
      defaultValue: "activo",
    },
    fecha_inicio: { type: DataTypes.DATEONLY, allowNull: false },
    fecha_fin_estimada: { type: DataTypes.DATEONLY, allowNull: true },
    fecha_completado: { type: DataTypes.DATEONLY, allowNull: true },
    fecha_cierre: { type: DataTypes.DATE(3), allowNull: true },
    usuario_activo: {
      type: DataTypes.STRING(36),
      allowNull: true,
      unique: true,
    },
    valor_inicial: { type: DataTypes.DECIMAL(8, 2), allowNull: true },
  },
  { tableName: "objetivos", timestamps: false },
);

module.exports = Objetivo;
