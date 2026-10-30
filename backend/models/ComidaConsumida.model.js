const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const ComidaConsumida = sequelize.define(
  "ComidaConsumida",
  {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    dvh: { type: DataTypes.STRING(64), allowNull: false, defaultValue: "" },
    usuario_id: { type: DataTypes.UUID, allowNull: false },
    nombre_comida: { type: DataTypes.STRING(150), allowNull: false },
    tipo_comida: { type: DataTypes.STRING(50), allowNull: true },
    fecha_consumo: { type: DataTypes.DATE(3), allowNull: false },
    cantidad_consumida: { type: DataTypes.DECIMAL(6, 2), allowNull: true },
    unidad: { type: DataTypes.STRING(30), allowNull: true },
    calorias_totales: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    proteinas_totales_g: { type: DataTypes.DECIMAL(6, 2), allowNull: true },
    carbohidratos_totales_g: { type: DataTypes.DECIMAL(6, 2), allowNull: true },
    grasas_totales_g: { type: DataTypes.DECIMAL(6, 2), allowNull: true },
    alimentos: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
  },
  { tableName: "comidas_consumidas", timestamps: false },
);

module.exports = ComidaConsumida;
