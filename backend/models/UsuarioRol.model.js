const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const UsuarioRol = sequelize.define(
  "UsuarioRol",
  {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    dvh: { type: DataTypes.STRING(64), allowNull: false, defaultValue: "" },
    usuario_id: { type: DataTypes.UUID, allowNull: false },
    rol_id: { type: DataTypes.UUID, allowNull: false },
    fecha_asignacion: { type: DataTypes.DATE(3), allowNull: false },
  },
  { tableName: "usuario_roles", timestamps: false },
);

module.exports = UsuarioRol;
