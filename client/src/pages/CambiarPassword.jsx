import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
export default function CambiarPassword({ setUsuario }) {
  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [repetida, setRepetida] = useState("");
  const [aviso, setAviso] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const navegar = useNavigate();
  async function cambiar(e) {
    e.preventDefault();
    if (nueva !== repetida) {
      setAviso("Las contraseñas nuevas no coinciden.");
      return;
    }
    setOcupado(true);
    try {
      await axios.put("/cuenta/password", { actual, nueva });
      setUsuario(null);
      navegar("/login");
    } catch (error) {
      if (error.response && error.response.data)
        setAviso(error.response.data.message);
      else setAviso("No se pudo conectar con el servidor.");
    } finally {
      setOcupado(false);
    }
  }
  return (
    <form className="tarjeta" onSubmit={cambiar}>
      <h2>Cambiar contraseña</h2>
      <p>
        Al guardar se cerrarán todas tus sesiones. Volvé a entrar con la
        contraseña nueva.
      </p>
      <label>
        Contraseña actual
        <input
          required
          type="password"
          autoComplete="current-password"
          value={actual}
          onChange={(e) => setActual(e.target.value)}
        />
      </label>
      <label>
        Nueva contraseña
        <input
          required
          type="password"
          autoComplete="new-password"
          minLength={10}
          maxLength={72}
          value={nueva}
          onChange={(e) => setNueva(e.target.value)}
        />
      </label>
      <label>
        Repetir nueva contraseña
        <input
          required
          type="password"
          autoComplete="new-password"
          minLength={10}
          maxLength={72}
          value={repetida}
          onChange={(e) => setRepetida(e.target.value)}
        />
      </label>
      {aviso && (
        <p role="status" className="aviso">
          {aviso}
        </p>
      )}
      <button disabled={ocupado}>Guardar nueva contraseña</button>
    </form>
  );
}
