const bcrypt = require("bcrypt");
const crypto = require("node:crypto");
const encriptarIrreversible = (password) => bcrypt.hash(password, 10);
const compararPassword = (password, hash) => bcrypt.compare(password, hash);
const tokenNuevo = () => crypto.randomBytes(32).toString("hex");
const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");
function encriptarRreversible(texto) {
  if (!texto) {
    return null;
  }
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(
    "aes-256-gcm",
    Buffer.from(process.env.ENCRYPTION_KEY, "hex"),
    iv,
  );
  const contenido = Buffer.concat([
    cipher.update(texto, "utf8"),
    cipher.final(),
  ]);
  return (
    iv.toString("hex") +
    ":" +
    cipher.getAuthTag().toString("hex") +
    ":" +
    contenido.toString("hex")
  );
}
function desencriptar(texto) {
  if (!texto) {
    return "";
  }
  const partes = texto.split(":");
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    Buffer.from(process.env.ENCRYPTION_KEY, "hex"),
    Buffer.from(partes[0], "hex"),
  );
  decipher.setAuthTag(Buffer.from(partes[1], "hex"));
  return Buffer.concat([
    decipher.update(Buffer.from(partes[2], "hex")),
    decipher.final(),
  ]).toString("utf8");
}
module.exports = {
  encriptarIrreversible,
  compararPassword,
  tokenNuevo,
  hashToken,
  encriptarRreversible,
  desencriptar,
};
