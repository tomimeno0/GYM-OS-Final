const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const MedicionFisica = sequelize.define(
  "MedicionFisica",
  {
    usuario_inicial: { type: DataTypes.UUID, allowNull: true, unique: true },
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    dvh: { type: DataTypes.STRING(64), allowNull: false, defaultValue: "" },
    usuario_id: { type: DataTypes.UUID, allowNull: false },
    peso_kg: { type: DataTypes.DECIMAL(5, 2), allowNull: false },
    altura_cm: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
    grasa_corporal: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
    musculo_corporal: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
    nivel_actividad: { type: DataTypes.STRING(50), allowNull: true },
    fecha_medicion: { type: DataTypes.DATE(3), allowNull: false },
    cintura_cm: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
    pecho_cm: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
    brazos_cm: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
    piernas_cm: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
  },
  { tableName: "mediciones_fisicas", timestamps: false },
);

module.exports = MedicionFisica;
