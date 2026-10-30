import { useEffect, useState } from "react";
import {
  Link,
  NavLink,
  Navigate,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import axios from "axios";
import Confirmar from "./components/Confirmar";
import Administracion from "./pages/Administracion";
import Acceso from "./pages/Acceso";
import Recuperar from "./pages/Recuperar";
import Cuenta from "./pages/Cuenta";
import Progreso from "./pages/Progreso";
import Medidas from "./pages/Medidas";
import Objetivos from "./pages/Objetivos";
import Rutinas from "./pages/Rutinas";
import Entrenamientos from "./pages/Entrenamientos";
import Nutricion from "./pages/Nutricion";
import Asistente from "./pages/Asistente";
axios.defaults.baseURL = "/api";
axios.defaults.withCredentials = true;
export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [confirmacion, setConfirmacion] = useState(false);
  const navegar = useNavigate();
  async function cargarCuenta() {
    try {
      const respuesta = await axios.get("/cuenta");
      setUsuario(respuesta.data.user);
    } catch (error) {
      if (!error.response || error.response.status !== 401) {
        setError(
          "No se pudo conectar con el servidor. Recargá para volver a intentar.",
        );
      }
    } finally {
      setCargando(false);
    }
  }
  useEffect(() => {
    cargarCuenta();
  }, []);
  async function salir(confirmado = false) {
    if (!confirmado) {
      setConfirmacion(true);
      return;
    }
    setConfirmacion(false);
    try {
      await axios.post("/logout", {
        confirmar: true,
      });
      setUsuario(null);
      navegar("/");
    } catch (e) {
      if (e.response && e.response.data && e.response.data.message) {
        setError(e.response.data.message);
      } else {
        setError("No se pudo cerrar la sesión.");
      }
    }
  }
  if (cargando) {
    return <main className="cargando">Cargando GYM-OS…</main>;
  }
  return (
    <>
      {confirmacion && (
        <Confirmar
          texto="¿Cerrar tu sesión?"
          onAceptar={() => salir(true)}
          onCancelar={() => setConfirmacion(false)}
        />
      )}{" "}
      {usuario && (
        <aside className="sidebar">
          <Link className="marca" to="/dashboard">
            GYM<span>—</span>OS<small>Tu próximo paso.</small>
          </Link>
          <p className="nav-label">MI ESPACIO</p>
          <nav>
            {[
              ["/dashboard", "◈", "Resumen"],
              ["/medidas", "↗", "Medidas y progreso"],
              ["/objetivos", "◎", "Objetivos"],
              ["/rutinas", "▤", "Rutinas"],
              ["/entrenamientos", "▶", "Entrenamientos"],
              ["/dietas", "◒", "Dietas"],
              ["/consumos", "＋", "Consumos y macros"],
              ["/asistente", "✦", "Asistente IA"],
              ["/cuenta", "○", "Mi cuenta"],
            ].map(([url, icon, texto]) => (
              <NavLink key={url} to={url}>
                <span aria-hidden="true">{icon}</span>
                {texto}
              </NavLink>
            ))}
            {(usuario.administrador ||
              (usuario.permisos && usuario.permisos.length > 0)) && (
              <NavLink to="/admin">
                <span>⚙</span>Administración
              </NavLink>
            )}
          </nav>
          <div className="nav-pie">
            <strong>{usuario.nombre}</strong>
            <small>Entrega final · edición 100</small>
            <button className="secundario" onClick={() => salir()}>
              Cerrar sesión
            </button>
          </div>
        </aside>
      )}
      <div className={usuario ? "contenido" : ""}>
        {error && (
          <p role="alert" className="aviso error">
            {error}
            <button onClick={() => setError("")} aria-label="Cerrar aviso">
              ×
            </button>
          </p>
        )}
        <Routes>
          <Route
            path="/admin"
            element={
              usuario &&
              (usuario.administrador ||
                (usuario.permisos && usuario.permisos.length > 0)) ? (
                <Administracion usuario={usuario} />
              ) : (
                <Navigate to="/dashboard" />
              )
            }
          />
          <Route
            path="/recuperar"
            element={<Recuperar key="solicitar" setUsuario={setUsuario} />}
          />
          <Route
            path="/restablecer"
            element={
              <Recuperar
                key="restablecer"
                restablecer
                setUsuario={setUsuario}
              />
            }
          />
          <Route
            path="/"
            element={usuario ? <Navigate to="/dashboard" /> : <Inicio />}
          />
          {["login", "registro"].map((modo) => (
            <Route
              key={modo}
              path={"/" + modo}
              element={
                usuario ? (
                  <Navigate to="/dashboard" />
                ) : (
                  <Acceso modo={modo} setUsuario={setUsuario} />
                )
              }
            />
          ))}
          <Route
            path="/dashboard"
            element={
              usuario ? (
                <Progreso usuario={usuario} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/medidas"
            element={
              usuario ? <Medidas usuario={usuario} /> : <Navigate to="/login" />
            }
          />
          <Route
            path="/objetivos"
            element={
              usuario ? (
                <Objetivos usuario={usuario} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/rutinas"
            element={usuario ? <Rutinas /> : <Navigate to="/login" />}
          />
          <Route
            path="/entrenamientos"
            element={usuario ? <Entrenamientos /> : <Navigate to="/login" />}
          />
          <Route
            path="/dietas"
            element={
              usuario ? (
                <Nutricion key="dietas" modo="dietas" usuario={usuario} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/consumos"
            element={
              usuario ? (
                <Nutricion key="consumos" modo="consumos" usuario={usuario} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/asistente"
            element={
              usuario ? (
                <Asistente usuario={usuario} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/cuenta"
            element={
              usuario ? (
                <Cuenta usuario={usuario} setUsuario={setUsuario} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="*"
            element={
              <main>
                <h1>Página no encontrada</h1>
                <Link to="/">Volver al inicio</Link>
              </main>
            }
          />
        </Routes>
      </div>
    </>
  );
}
function Inicio() {
  return (
    <div className="inicio">
      <header>
        <Link className="marca" to="/">
          GYM<span>—</span>OS
        </Link>
        <div className="acciones">
          <Link to="/login">Iniciar sesión</Link>
          <Link className="boton" to="/registro">
            Crear cuenta ↗
          </Link>
        </div>
      </header>
      <main className="hero">
        <p className="etiqueta">ENTRENÁ CON DIRECCIÓN</p>
        <h1>
          Tu esfuerzo.
          <br />
          Un plan.
          <br />
          <em>Más progreso.</em>
        </h1>
        <p className="bajada">
          Organizá tus rutinas, entendé tus hábitos y registrá cada avance. Todo
          tu entrenamiento, en un solo lugar.
        </p>
        <Link className="boton" to="/registro">
          Empezar mi camino ↗
        </Link>
        <div className="hero-cifras">
          <span>
            01 <small>Definí tu objetivo</small>
          </span>
          <span>
            02 <small>Armá tu rutina</small>
          </span>
          <span>
            03 <small>Seguí tu progreso</small>
          </span>
        </div>
        <div className="hero-dibujo" aria-hidden="true">
          <span>G</span>
          <div className="hero-tarjeta">
            CONSTANCIA &gt; PERFECCIÓN
            <br />
            <strong>Un día a la vez.</strong>
          </div>
        </div>
      </main>
      <footer>GYM-OS · Proyecto educativo · React + Express + MySQL</footer>
    </div>
  );
}
