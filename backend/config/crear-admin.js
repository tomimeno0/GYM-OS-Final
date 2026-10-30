require("dotenv").config({ quiet: true });
const { sequelize } = require("./db");
const { Usuario, Rol, UsuarioRol } = require("../models");
const {
  encriptarIrreversible,
} = require("../controllers/seguridad.controller");
async function crearAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (
    !email ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    !password ||
    password.length < 10 ||
    Buffer.byteLength(password) > 72
  )
    throw Error("Configurá ADMIN_EMAIL y ADMIN_PASSWORD válidos en .env.");
  const rol = await Rol.findOne({ where: { nombre: "Administrador" } });
  if (!rol) throw Error("Ejecutá npm run db:iniciar.");
  const transaction = await sequelize.transaction();
  try {
    const [usuario] = await Usuario.findOrCreate({
      where: { email: email.trim().toLowerCase() },
      defaults: {
        nombre: "Administrador",
        password_hash: await encriptarIrreversible(password),
        fecha_registro: new Date(),
      },
      transaction,
    });
    await UsuarioRol.findOrCreate({
      where: { usuario_id: usuario.id, rol_id: rol.id },
      defaults: { fecha_asignacion: new Date() },
      transaction,
    });
    await transaction.commit();
    console.log(
      "Cuenta administradora preparada. No se cambió la contraseña de una cuenta existente.",
    );
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}
crearAdmin()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => sequelize.close());
