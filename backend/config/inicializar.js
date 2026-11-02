require("dotenv").config({ quiet: true });
const { sequelize } = require("./db");
const { Rol, Usuario, UsuarioRol } = require("../models");
const {
  encriptarIrreversible,
} = require("../controllers/seguridad.controller");
async function inicializar() {
  await sequelize.authenticate();
  await sequelize.sync();
  await require("./actualizar-login").actualizarProteccionLogin();
  const [rol] = await Rol.findOrCreate({
    where: { nombre: "Cliente" },
    defaults: {
      descripcion: "Usuario de la aplicación",
      fecha_creacion: new Date(),
      permisos: [],
      sistema: true,
    },
  });
  await Rol.findOrCreate({
    where: { nombre: "Administrador" },
    defaults: {
      descripcion: "Administración del sistema",
      permisos: ["administrar"],
      sistema: true,
      fecha_creacion: new Date(),
    },
  });
  if (process.env.DEMO_PASSWORD && process.env.DEMO_PASSWORD !== "CAMBIAR") {
    const [usuario, creado] = await Usuario.findOrCreate({
      where: { email: "demo@gymos.local" },
      defaults: {
        nombre: "Cuenta",
        apellido: "Demostración",
        password_hash: await encriptarIrreversible(process.env.DEMO_PASSWORD),
        fecha_registro: new Date(),
      },
    });
    if (creado)
      await UsuarioRol.create({
        usuario_id: usuario.id,
        rol_id: rol.id,
        fecha_asignacion: new Date(),
      });
  }
  console.log(
    "Base inicializada sin borrar datos; protección de login actualizada.",
  );
}
inicializar()
  .catch(() => {
    console.error("No se pudo inicializar. Revisá la conexión y el esquema.");
    process.exitCode = 1;
  })
  .finally(() => sequelize.close());
