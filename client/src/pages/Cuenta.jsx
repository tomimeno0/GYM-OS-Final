import CambiarPassword from "./CambiarPassword";
import Confirmar from "../components/Confirmar";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
export default function Cuenta({ usuario, setUsuario }) {
  const [datos, setDatos] = useState({
    id: usuario.id,
    nombre: usuario.nombre,
    email: usuario.email,
    zona_horaria: usuario.zona_horaria,
    consentimiento_ia: usuario.consentimiento_ia,
    telefono: usuario.telefono || "",
    apellido: usuario.apellido || "",
    fecha_nacimiento: usuario.fecha_nacimiento || "",
    genero: usuario.genero || "otro",
  });
  const [password, setPassword] = useState("");
  const [aviso, setAviso] = useState("");
  const [confirmacion, setConfirmacion] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const navegar = useNavigate();
  function cambiar(evento) {
    const nuevosDatos = {
      id: datos.id,
      nombre: datos.nombre,
      apellido: datos.apellido,
      email: datos.email,
      telefono: datos.telefono,
      genero: datos.genero,
      fecha_nacimiento: datos.fecha_nacimiento,
      zona_horaria: datos.zona_horaria,
      consentimiento_ia: datos.consentimiento_ia,
    };
    const campo = evento.target.name;
    if (evento.target.type === "checkbox") {
      nuevosDatos[campo] = evento.target.checked;
    } else {
      nuevosDatos[campo] = evento.target.value;
    }
    setDatos(nuevosDatos);
  }
  async function guardar(e) {
    e.preventDefault();
    setOcupado(true);
    setAviso("");
    try {
      const r = await axios.put("/cuenta", datos);
      setUsuario(r.data.user);
      setAviso("Perfil actualizado.");
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setAviso(error.response.data.message);
      } else {
        setAviso("No se pudo guardar.");
      }
    } finally {
      setOcupado(false);
    }
  }
  async function eliminar(e, confirmado = false) {
    if (e) {
      e.preventDefault();
    }
    if (!confirmado) {
      setConfirmacion(true);
      return;
    }
    setConfirmacion(null);
    setOcupado(true);
    try {
      await axios.delete("/cuenta", {
        data: {
          password,
          confirmar: true,
        },
      });
      setUsuario(null);
      navegar("/");
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setAviso(error.response.data.message);
      } else {
        setAviso("No se pudo eliminar.");
      }
    } finally {
      setOcupado(false);
    }
  }
  return (
    <main>
      {confirmacion && (
        <Confirmar
          texto="¿Eliminar definitivamente tu cuenta y todos tus registros? No se puede deshacer."
          onAceptar={() => eliminar(null, true)}
          onCancelar={() => setConfirmacion(null)}
        />
      )}
      <p className="etiqueta">TU PERFIL</p>
      <h1>Mi cuenta</h1>
      <p className="muted">Tu información y el control de tus datos.</p>
      {aviso && (
        <p role="status" className="aviso">
          {aviso}
        </p>
      )}
      <form className="tarjeta" onSubmit={guardar}>
        <div className="grilla dos">
          {[
            ["nombre", "Nombre"],
            ["apellido", "Apellido"],
            ["telefono", "Teléfono"],
            ["fecha_nacimiento", "Fecha de nacimiento"],
            ["zona_horaria", "Zona horaria"],
          ].map(([campo, titulo]) => (
            <label key={campo}>
              {titulo}
              <input
                name={campo}
                required={["nombre", "zona_horaria"].includes(campo)}
                type={campo === "fecha_nacimiento" ? "date" : "text"}
                value={datos[campo]}
                onChange={cambiar}
              />
            </label>
          ))}
          <label>
            Género
            <select name="genero" value={datos.genero} onChange={cambiar}>
              <option value="otro">Otro / prefiero no indicar</option>
              <option value="masculino">Masculino</option>
              <option value="femenino">Femenino</option>
            </select>
          </label>
        </div>
        <p>Correo: {usuario.email}</p>
        <label className="check">
          <input
            type="checkbox"
            name="consentimiento_ia"
            checked={datos.consentimiento_ia}
            onChange={cambiar}
          />
          Autorizo enviar a Cohere mis consultas y, al generar rutinas o dietas,
          medidas, objetivo y resumen de entrenamientos.
        </label>
        <p className="muted">
          La IA usa un proveedor externo. No envíes datos sensibles
          innecesarios. Podés retirar este permiso en cualquier momento. Las
          respuestas son orientación general.
        </p>
        <button disabled={ocupado}>Guardar perfil</button>
      </form>
      <CambiarPassword setUsuario={setUsuario} />
      <form className="tarjeta peligro" onSubmit={eliminar}>
        <h2>Eliminar cuenta</h2>
        <p>Esta acción borra tus datos y no se puede deshacer.</p>
        <label>
          Contraseña actual
          <input
            required
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <button className="destructivo" disabled={ocupado}>
          Eliminar mi cuenta
        </button>
      </form>
    </main>
  );
}
