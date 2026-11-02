require("dotenv").config({ quiet: true });
const { DataTypes } = require("sequelize");
const { sequelize } = require("./db");
async function actualizarProteccionLogin() {
  const consulta = sequelize.getQueryInterface();
  const columnas = await consulta.describeTable("usuarios");
  if (!columnas.intentos_fallidos) {
    await consulta.addColumn("usuarios", "intentos_fallidos", {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
  }
  if (!columnas.ultimo_intento_fallido) {
    await consulta.addColumn("usuarios", "ultimo_intento_fallido", {
      type: DataTypes.DATE(3),
      allowNull: true,
    });
  }
  if (!columnas.bloqueado_hasta) {
    await consulta.addColumn("usuarios", "bloqueado_hasta", {
      type: DataTypes.DATE(3),
      allowNull: true,
    });
  }
}
if (require.main === module) {
  actualizarProteccionLogin()
    .then(() =>
      console.log("Protección de login actualizada sin borrar usuarios."),
    )
    .catch(() => {
      console.error(
        "No se pudo actualizar. Revisá MySQL y ejecutá db:iniciar si falta la base.",
      );
      process.exitCode = 1;
    })
    .finally(() => sequelize.close());
}
module.exports = { actualizarProteccionLogin };
