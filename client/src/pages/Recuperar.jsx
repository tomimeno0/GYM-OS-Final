import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
export default function Recuperar({ restablecer, setUsuario }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [token] = useState(() => {
    const valor = window.location.hash.slice(1);
    if (valor) window.history.replaceState(null, "", window.location.pathname);
    return valor;
  });
  const [aviso, setAviso] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [terminado, setTerminado] = useState(false);
  async function enviar(e) {
    e.preventDefault();
    if (restablecer && password !== confirmacion) {
      setAviso("Las contraseñas no coinciden.");
      return;
    }
    setOcupado(true);
    setAviso("");
    try {
      let respuesta;
      if (restablecer) {
        respuesta = await axios.post("/restablecer-password", {
          token,
          password,
        });
        setUsuario(null);
      } else {
        respuesta = await axios.post("/recuperar-password", { email });
      }
      setAviso(respuesta.data.message);
      setTerminado(true);
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setAviso(error.response.data.message);
      } else {
        setAviso("No se pudo conectar con el servidor.");
      }
    } finally {
      setOcupado(false);
    }
  }
  return (
    <main className="acceso">
      <Link className="marca" to="/">
        GYM<span>—</span>OS
      </Link>
      <div className="tarjeta acceso-form">
        <p className="etiqueta">RECUPERÁ TU ACCESO</p>
        <h1>
          {restablecer
            ? "Elegí tu nueva contraseña."
            : "¿Olvidaste tu contraseña?"}
        </h1>
        {!terminado && (
          <form onSubmit={enviar}>
            {restablecer ? (
              <>
                <label>
                  Nueva contraseña
                  <input
                    required
                    type="password"
                    autoComplete="new-password"
                    minLength={10}
                    maxLength={72}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </label>
                <label>
                  Repetir contraseña
                  <input
                    required
                    type="password"
                    autoComplete="new-password"
                    minLength={10}
                    maxLength={72}
                    value={confirmacion}
                    onChange={(e) => setConfirmacion(e.target.value)}
                  />
                </label>
                <small>
                  Al menos 10 caracteres y hasta 72 bytes. Se cerrarán tus
                  sesiones anteriores.
                </small>
              </>
            ) : (
              <label>
                Correo electrónico
                <input
                  required
                  type="email"
                  autoComplete="email"
                  maxLength={150}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
            )}
            <button disabled={ocupado || (restablecer && !token)}>
              {ocupado
                ? "Procesando…"
                : restablecer
                  ? "Guardar contraseña"
                  : "Enviar enlace"}
            </button>
          </form>
        )}
        {restablecer && !token && !terminado && (
          <p className="aviso">
            Abrí el enlace que recibiste por correo o pedí uno nuevo.
          </p>
        )}
        {aviso && (
          <p role="status" className="aviso">
            {aviso}
          </p>
        )}
        <div className="enlaces">
          <Link to="/login">Volver a iniciar sesión</Link>
          <Link to="/recuperar">Pedir otro enlace</Link>
        </div>
      </div>
    </main>
  );
}
