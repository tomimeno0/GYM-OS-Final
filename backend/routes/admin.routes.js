const router = require("express").Router();
const {
  verificarSesion,
  verificarPermiso,
} = require("../controllers/auth.controller");
const admin = require("../controllers/admin.controller");
router.use(verificarSesion);
router.get("/usuarios", verificarPermiso("usuarios:ver"), admin.listarUsuarios);
router.post(
  "/usuarios",
  verificarPermiso("usuarios:editar"),
  admin.crearUsuario,
);
router.put(
  "/usuarios/:id",
  verificarPermiso("usuarios:editar"),
  admin.editarUsuario,
);
router.patch(
  "/usuarios/:id/estado",
  verificarPermiso("usuarios:editar"),
  (req, res) => {
    if (req.body.estado === "activo") return admin.activarUsuario(req, res);
    if (req.body.estado === "bloqueado") return admin.bloquearUsuario(req, res);
    return res.status(400).json({ message: "Estado inválido." });
  },
);
router.delete(
  "/usuarios/:id",
  verificarPermiso("usuarios:editar"),
  admin.eliminarUsuario,
);
router.get("/roles", verificarPermiso("roles:gestionar"), admin.listarRoles);
router.post("/roles", verificarPermiso("roles:gestionar"), admin.crearRoles);
router.put(
  "/roles/:id",
  verificarPermiso("roles:gestionar"),
  admin.modificarRoles,
);
router.delete(
  "/roles/:id",
  verificarPermiso("roles:gestionar"),
  admin.eliminarRol,
);
router.put(
  "/usuarios/:id/roles",
  verificarPermiso("roles:gestionar"),
  admin.asignarRoles,
);
router.get("/bitacora", verificarPermiso("auditoria:ver"), admin.verBitacora);
module.exports = router;
