const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const DietaComida = sequelize.define(
  "DietaComida",
  {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    dvh: { type: DataTypes.STRING(64), allowNull: false, defaultValue: "" },
    dieta_id: { type: DataTypes.UUID, allowNull: false },
    nombre_comida: { type: DataTypes.STRING(150), allowNull: false },
    tipo_comida: { type: DataTypes.STRING(50), allowNull: true },
    hora: { type: DataTypes.STRING(5), allowNull: true },
    cantidad: { type: DataTypes.DECIMAL(6, 2), allowNull: true },
    unidad: { type: DataTypes.STRING(30), allowNull: true },
    calorias: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    proteinas_g: { type: DataTypes.DECIMAL(6, 2), allowNull: true },
    carbohidratos_g: { type: DataTypes.DECIMAL(6, 2), allowNull: true },
    grasas_g: { type: DataTypes.DECIMAL(6, 2), allowNull: true },
    alimentos: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
    observaciones: { type: DataTypes.TEXT },
  },
  { tableName: "dieta_comidas", timestamps: false },
);

module.exports = DietaComida;
