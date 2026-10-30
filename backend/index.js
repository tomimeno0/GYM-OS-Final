require("dotenv").config({
  quiet: true,
});
const express = require("express");
const cookieParser = require("cookie-parser");
const path = require("path");
const fs = require("fs");
const { sequelize } = require("./config/db");
require("./models");
const app = express();
app.disable("x-powered-by");
app.use(
  express.json({
    limit: "200kb",
  }),
);
app.use(cookieParser());
app.use("/api", (req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});
app.get("/api/salud", async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({
      estado: "ok",
      version: "100",
    });
  } catch (error) {
    res.status(503).json({
      message: "Base de datos no disponible.",
    });
  }
});
app.use("/api", require("./routes/usuarios.routes"));
app.use("/api/admin", require("./routes/admin.routes"));
app.use("/api", require("./routes/gimnasio.routes"));
app.use("/api", (req, res) =>
  res.status(404).json({
    message: "Ruta no encontrada.",
  }),
);
const dist = path.join(__dirname, "..", "client", "dist");
if (fs.existsSync(path.join(dist, "index.html"))) {
  app.use(express.static(dist));
  app.get("/{*ruta}", (req, res) =>
    res.sendFile(path.join(dist, "index.html")),
  );
}
app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }
  let codigoRespuesta;
  if (error.type === "entity.parse.failed") {
    codigoRespuesta = 400;
  } else {
    if (error.type === "entity.too.large") {
      codigoRespuesta = 413;
    } else {
      codigoRespuesta = 500;
    }
  }
  res.status(codigoRespuesta).json({
    message: "No se pudo procesar la solicitud.",
  });
});
async function iniciar() {
  if (
    !process.env.JWT_SECRET ||
    process.env.JWT_SECRET.length < 32 ||
    !/^[a-f0-9]{64}$/i.test(process.env.ENCRYPTION_KEY || "")
  ) {
    throw new Error("Configurá JWT_SECRET y ENCRYPTION_KEY en .env.");
  }
  await sequelize.authenticate();
  const puerto = Number(process.env.PORT || 5176);
  app.listen(puerto, "::1", () =>
    console.log("GYM-OS 100: http://localhost:" + puerto),
  );
  app.listen(puerto, "127.0.0.1");
}
if (require.main === module) {
  iniciar().catch(() => {
    console.error(
      "No se pudo iniciar. Revisá .env, MySQL y la inicialización de la base.",
    );
    process.exitCode = 1;
  });
}
module.exports = app;
