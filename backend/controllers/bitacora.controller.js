const { Bitacora } = require("../models");
async function registrarEvento(usuario_id, accion, modulo, transaction) {
  await Bitacora.create(
    {
      usuario_id,
      accion,
      modulo,
      fecha_hora: new Date(),
      resultado: "exitoso",
    },
    {
      transaction,
    },
  );
}
module.exports = {
  registrarEvento,
};
