require("dotenv").config({ quiet: true });
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 3312),
    dialect: "mysql",
    logging: false,
    timezone: "+00:00",
    dialectOptions: { decimalNumbers: true },
  },
);

module.exports = { sequelize };
