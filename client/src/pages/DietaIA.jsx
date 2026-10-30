import { useState } from "react";
import axios from "axios";
export default function DietaIA({ items, alGuardar }) {
  const [preferencias, setPreferencias] = useState("");
  const [dietaId, setDietaId] = useState("");
  const [confirmar, setConfirmar] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [aviso, setAviso] = useState("");
  async function generar(e) {
    e.preventDefault();
    setOcupado(true);
    setAviso("");
    try {
      let ruta = "/ia/dietas";
      if (dietaId) ruta += "/" + dietaId + "/adaptar";
      await axios.post(ruta, { preferencias, confirmar });
      await alGuardar();
      setAviso(
        "Propuesta guardada. Revisá los alimentos y cantidades antes de usarla.",
      );
    } catch (error) {
      if (error.response && error.response.data)
        setAviso(error.response.data.message);
      else setAviso("No se pudo conectar con el servidor.");
    } finally {
      setOcupado(false);
    }
  }
  return (
    <form className="tarjeta" onSubmit={generar}>
      <h2>Propuesta de dieta con IA</h2>
      <p>
        Necesitás medidas, un objetivo activo y consentimiento en Mi cuenta. Es
        orientación general editable.
      </p>
      <label>
        Plan a generar o adaptar
        <select value={dietaId} onChange={(e) => setDietaId(e.target.value)}>
          <option value="">Crear una dieta nueva</option>
          {items.map((d) => (
            <option key={d.id} value={d.id}>
              {d.nombre}
            </option>
          ))}
        </select>
      </label>
      <label>
        Preferencias de alimentación
        <textarea
          required
          minLength={3}
          maxLength={1000}
          value={preferencias}
          onChange={(e) => setPreferencias(e.target.value)}
          placeholder="Por ejemplo: comidas sencillas, tres horarios, ingredientes económicos."
        />
      </label>
      <label className="check">
        <input
          required
          type="checkbox"
          checked={confirmar}
          onChange={(e) => setConfirmar(e.target.checked)}
        />
        Confirmo el envío de preferencias, medidas, objetivo y resumen de
        consumos a Cohere. Al adaptar se reemplazan las comidas de esa dieta.
      </label>
      <button disabled={ocupado}>
        {ocupado ? "Generando propuesta…" : "Generar propuesta"}
      </button>
      {aviso && (
        <p role="status" className="aviso">
          {aviso}
        </p>
      )}
    </form>
  );
}
