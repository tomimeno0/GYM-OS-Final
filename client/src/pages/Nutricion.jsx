import DietaIA from "./DietaIA";
import Confirmar from "../components/Confirmar";
import { useEffect, useState } from "react";
import axios from "axios";
const alimentoNuevo = () => ({
  nombre: "",
  cantidad: 100,
  unidad: "g",
  calorias: 0,
  proteinas_g: 0,
  carbohidratos_g: 0,
  grasas_g: 0,
});
const comidaNueva = () => ({
  nombre_comida: "",
  tipo_comida: "desayuno",
  hora: "08:00",
  alimentos: [alimentoNuevo()],
});
const dietaNueva = () => ({
  nombre: "",
  descripcion: "",
  objetivo_id: "",
  calorias_objetivo: 2000,
  proteinas_objetivo_g: 0,
  carbohidratos_objetivo_g: 0,
  grasas_objetivo_g: 0,
  comidas: [comidaNueva()],
});
export default function Nutricion({ modo, usuario }) {
  const esDieta = modo === "dietas";
  const [items, setItems] = useState([]);
  const [objetivos, setObjetivos] = useState([]);
  const [datos, setDatos] = useState(dietaNueva);
  const [comida, setComida] = useState(comidaNueva);
  const [fecha, setFecha] = useState(
    new Date().toLocaleDateString("en-CA", {
      timeZone: usuario.zona_horaria,
      hour12: false,
    }),
  );
  const [fechaConsumo, setFechaConsumo] = useState("");
  const [resumen, setResumen] = useState(null);
  const [editando, setEditando] = useState(null);
  const [aviso, setAviso] = useState("");
  const [confirmacion, setConfirmacion] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  async function cargar() {
    try {
      if (esDieta) {
        setItems((await axios.get("/dietas")).data.items);
        setObjetivos((await axios.get("/objetivos")).data.items);
      } else {
        const r = await axios.get("/consumos", {
          params: {
            fecha,
          },
        });
        setResumen(r.data);
        setItems(r.data.items);
      }
    } catch (e) {
      if (e.response && e.response.data && e.response.data.message) {
        setAviso(e.response.data.message);
      } else {
        setAviso("No se pudo cargar la nutrición.");
      }
    }
  }
  useEffect(() => {
    cargar();
  }, [fecha]);
  function copiarAlimento(alimento) {
    return {
      nombre: alimento.nombre,
      cantidad: alimento.cantidad,
      unidad: alimento.unidad,
      calorias: alimento.calorias,
      proteinas_g: alimento.proteinas_g,
      carbohidratos_g: alimento.carbohidratos_g,
      grasas_g: alimento.grasas_g,
    };
  }
  function copiarComida(comida) {
    return {
      nombre_comida: comida.nombre_comida,
      tipo_comida: comida.tipo_comida,
      hora: comida.hora,
      alimentos: comida.alimentos.slice(),
    };
  }
  function cambiarComida(indice, campo, valor) {
    if (esDieta) {
      const comidas = datos.comidas.slice();
      const nuevaComida = copiarComida(comidas[indice]);
      nuevaComida[campo] = valor;
      comidas[indice] = nuevaComida;
      setDatos({
        nombre: datos.nombre,
        descripcion: datos.descripcion,
        objetivo_id: datos.objetivo_id,
        calorias_objetivo: datos.calorias_objetivo,
        proteinas_objetivo_g: datos.proteinas_objetivo_g,
        carbohidratos_objetivo_g: datos.carbohidratos_objetivo_g,
        grasas_objetivo_g: datos.grasas_objetivo_g,
        comidas,
      });
    } else {
      const nuevaComida = copiarComida(comida);
      nuevaComida[campo] = valor;
      setComida(nuevaComida);
    }
  }
  function cambiarAlimento(indiceComida, indiceAlimento, campo, valor) {
    let comidaActual = comida;
    if (esDieta) {
      comidaActual = datos.comidas[indiceComida];
    }
    const alimentos = comidaActual.alimentos.slice();
    const alimento = copiarAlimento(alimentos[indiceAlimento]);
    alimento[campo] = valor;
    alimentos[indiceAlimento] = alimento;
    cambiarComida(indiceComida, "alimentos", alimentos);
  }
  function limpiar() {
    setEditando(null);
    setDatos(dietaNueva());
    setComida(comidaNueva());
    setFechaConsumo("");
  }
  async function guardar(e) {
    e.preventDefault();
    setOcupado(true);
    setAviso("");
    try {
      let cuerpo = datos;
      if (!esDieta) {
        let fechaReal;
        if (fechaConsumo) {
          fechaReal = new Date(fechaConsumo);
        } else {
          fechaReal = new Date();
        }
        if (!Number.isFinite(fechaReal.getTime())) {
          setAviso("Fecha de consumo no válida.");
          return;
        }
        cuerpo = {
          nombre_comida: comida.nombre_comida,
          tipo_comida: comida.tipo_comida,
          hora: comida.hora,
          alimentos: comida.alimentos,
          fecha_consumo: fechaReal.toISOString(),
        };
      }
      const url =
        (esDieta ? "/dietas" : "/consumos") + (editando ? "/" + editando : "");
      if (editando) {
        await axios.put(url, cuerpo);
      } else {
        await axios.post(url, cuerpo);
      }
      limpiar();
      await cargar();
      setAviso(esDieta ? "Dieta guardada." : "Consumo registrado.");
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
  function copiarComidas(comidasOriginales) {
    const comidas = [];
    for (let i = 0; i < comidasOriginales.length; i++) {
      const copia = copiarComida(comidasOriginales[i]);
      copia.hora = copia.hora || "08:00";
      comidas.push(copia);
    }
    return comidas;
  }
  function editar(item) {
    setEditando(item.id);
    if (esDieta) {
      setDatos({
        nombre: item.nombre,
        calorias_objetivo: item.calorias_objetivo,
        proteinas_objetivo_g: item.proteinas_objetivo_g,
        carbohidratos_objetivo_g: item.carbohidratos_objetivo_g,
        grasas_objetivo_g: item.grasas_objetivo_g,
        descripcion: item.descripcion || "",
        objetivo_id: item.objetivo_id || "",
        comidas: copiarComidas(item.comidas),
      });
    } else {
      setComida({
        nombre_comida: item.nombre_comida,
        tipo_comida: item.tipo_comida,
        hora: item.hora,
        alimentos: item.alimentos,
      });
      const d = new Date(item.fecha_consumo);
      setFechaConsumo(
        new Date(d.getTime() - d.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16),
      );
    }
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }
  async function eliminar(item, confirmado = false) {
    if (!confirmado) {
      setConfirmacion(item);
      return;
    }
    setConfirmacion(null);
    try {
      await axios.delete((esDieta ? "/dietas/" : "/consumos/") + item.id, {
        data: {
          confirmar: true,
        },
      });
      if (editando === item.id) {
        limpiar();
      }
      await cargar();
    } catch (e) {
      if (e.response && e.response.data && e.response.data.message) {
        setAviso(e.response.data.message);
      } else {
        setAviso("No se pudo eliminar.");
      }
    }
  }
  let comidas;
  if (esDieta) {
    comidas = datos.comidas;
  } else {
    comidas = [comida];
  }
  const objetivosDisponibles = [];
  for (let i = 0; i < objetivos.length; i++) {
    const objetivo = objetivos[i];
    if (objetivo.estado === "activo" || objetivo.id === datos.objetivo_id) {
      objetivosDisponibles.push(objetivo);
    }
  }
  function quitarAlimento(indiceComida, indiceAlimento) {
    let comidaActual = comida;
    if (esDieta) {
      comidaActual = datos.comidas[indiceComida];
    }
    const alimentos = [];
    for (let i = 0; i < comidaActual.alimentos.length; i++) {
      if (i !== indiceAlimento) {
        alimentos.push(comidaActual.alimentos[i]);
      }
    }
    cambiarComida(indiceComida, "alimentos", alimentos);
  }
  function agregarAlimento(indiceComida) {
    let comidaActual = comida;
    if (esDieta) {
      comidaActual = datos.comidas[indiceComida];
    }
    const alimentos = comidaActual.alimentos.slice();
    alimentos.push(alimentoNuevo());
    cambiarComida(indiceComida, "alimentos", alimentos);
  }
  function actualizarComidas(comidas) {
    setDatos({
      nombre: datos.nombre,
      descripcion: datos.descripcion,
      objetivo_id: datos.objetivo_id,
      calorias_objetivo: datos.calorias_objetivo,
      proteinas_objetivo_g: datos.proteinas_objetivo_g,
      carbohidratos_objetivo_g: datos.carbohidratos_objetivo_g,
      grasas_objetivo_g: datos.grasas_objetivo_g,
      comidas,
    });
  }
  function quitarComida(indice) {
    const comidas = [];
    for (let i = 0; i < datos.comidas.length; i++) {
      if (i !== indice) {
        comidas.push(datos.comidas[i]);
      }
    }
    actualizarComidas(comidas);
  }
  function agregarComida() {
    const comidas = datos.comidas.slice();
    comidas.push(comidaNueva());
    actualizarComidas(comidas);
  }
  return (
    <main>
      {confirmacion && (
        <Confirmar
          texto={
            esDieta
              ? "¿Dar de baja la dieta? Los consumos se conservan."
              : "¿Eliminar este consumo?"
          }
          onAceptar={() => eliminar(confirmacion, true)}
          onCancelar={() => setConfirmacion(null)}
        />
      )}
      <p className="etiqueta">HÁBITOS QUE SUMAN</p>
      <h1>{esDieta ? "Dietas" : "Consumos y macros"}</h1>
      <p className="muted">
        {esDieta
          ? "Planificar no significa consumir. Registrá después lo que realmente comiste."
          : "Los totales se calculan con las cantidades y los nutrientes que ingresás de la etiqueta."}
      </p>
      {aviso && (
        <p role="status" className="aviso">
          {aviso}
        </p>
      )}
      {!esDieta && (
        <section className="tarjeta">
          <label>
            Día a consultar
            <input
              type="date"
              required
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
          </label>
          {resumen && (
            <>
              <div className="grilla cuatro">
                {Object.entries(resumen.totales).map(([campo, valor]) => (
                  <div className="estadistica" key={campo}>
                    <small>{campo.replace("_g", " (g)")}</small>
                    <strong>{valor}</strong>
                  </div>
                ))}
              </div>
              {resumen.dieta ? (
                <p>
                  Meta de la dieta más reciente ({resumen.dieta.nombre}):{" "}
                  {resumen.dieta.calorias_objetivo} kcal · P{" "}
                  {resumen.dieta.proteinas_objetivo_g || 0} g · C{" "}
                  {resumen.dieta.carbohidratos_objetivo_g || 0} g · G{" "}
                  {resumen.dieta.grasas_objetivo_g || 0} g. Diferencia de
                  calorías:{" "}
                  {resumen.totales.calorias - resumen.dieta.calorias_objetivo}{" "}
                  kcal.
                </p>
              ) : (
                <p className="muted">Sin dieta activa para comparar.</p>
              )}
              <small>
                El día se calcula según la zona horaria de Mi cuenta.
              </small>
            </>
          )}
        </section>
      )}
      {esDieta && <DietaIA items={items} alGuardar={cargar} />}
      <form className="tarjeta" onSubmit={guardar}>
        <h2>
          {editando ? "Editar" : "Agregar"} {esDieta ? "dieta" : "consumo"}
        </h2>
        {esDieta ? (
          <>
            <div className="grilla dos">
              <label>
                Nombre
                <input
                  required
                  minLength={2}
                  maxLength={100}
                  value={datos.nombre}
                  onChange={(e) =>
                    setDatos({
                      descripcion: datos.descripcion,
                      objetivo_id: datos.objetivo_id,
                      calorias_objetivo: datos.calorias_objetivo,
                      proteinas_objetivo_g: datos.proteinas_objetivo_g,
                      carbohidratos_objetivo_g: datos.carbohidratos_objetivo_g,
                      grasas_objetivo_g: datos.grasas_objetivo_g,
                      comidas: datos.comidas,
                      nombre: e.target.value,
                    })
                  }
                />
              </label>
              <label>
                Objetivo
                <select
                  value={datos.objetivo_id}
                  onChange={(e) =>
                    setDatos({
                      nombre: datos.nombre,
                      descripcion: datos.descripcion,
                      calorias_objetivo: datos.calorias_objetivo,
                      proteinas_objetivo_g: datos.proteinas_objetivo_g,
                      carbohidratos_objetivo_g: datos.carbohidratos_objetivo_g,
                      grasas_objetivo_g: datos.grasas_objetivo_g,
                      comidas: datos.comidas,
                      objetivo_id: e.target.value,
                    })
                  }
                >
                  <option value="">Sin objetivo asociado</option>
                  {objetivosDisponibles.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.nombre}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label>
              Descripción
              <textarea
                maxLength={2000}
                value={datos.descripcion}
                onChange={(e) =>
                  setDatos({
                    nombre: datos.nombre,
                    objetivo_id: datos.objetivo_id,
                    calorias_objetivo: datos.calorias_objetivo,
                    proteinas_objetivo_g: datos.proteinas_objetivo_g,
                    carbohidratos_objetivo_g: datos.carbohidratos_objetivo_g,
                    grasas_objetivo_g: datos.grasas_objetivo_g,
                    comidas: datos.comidas,
                    descripcion: e.target.value,
                  })
                }
              />
            </label>
            <div className="grilla cuatro">
              {[
                ["calorias_objetivo", "Meta kcal"],
                ["proteinas_objetivo_g", "Meta proteínas (g)"],
                ["carbohidratos_objetivo_g", "Meta carbohidratos (g)"],
                ["grasas_objetivo_g", "Meta grasas (g)"],
              ].map(([campo, titulo]) => (
                <label key={campo}>
                  {titulo}
                  <input
                    required
                    type="number"
                    min="0"
                    max="9000"
                    step={campo === "calorias_objetivo" ? "1" : "0.01"}
                    value={datos[campo]}
                    onChange={(e) =>
                      setDatos({
                        nombre: datos.nombre,
                        descripcion: datos.descripcion,
                        objetivo_id: datos.objetivo_id,
                        calorias_objetivo: datos.calorias_objetivo,
                        proteinas_objetivo_g: datos.proteinas_objetivo_g,
                        carbohidratos_objetivo_g:
                          datos.carbohidratos_objetivo_g,
                        grasas_objetivo_g: datos.grasas_objetivo_g,
                        comidas: datos.comidas,
                        [campo]: Number(e.target.value),
                      })
                    }
                  />
                </label>
              ))}
            </div>
          </>
        ) : (
          <label>
            Fecha y hora de consumo (vacío = ahora)
            <input
              type="datetime-local"
              value={fechaConsumo}
              onChange={(e) => setFechaConsumo(e.target.value)}
            />
          </label>
        )}
        {comidas.map((c, ci) => (
          <fieldset key={ci}>
            <legend>
              {esDieta ? "Comida " + (ci + 1) : "Lo que consumiste"}
            </legend>
            <div className="grilla tres">
              <label>
                Nombre
                <input
                  required
                  maxLength={100}
                  value={c.nombre_comida}
                  onChange={(e) =>
                    cambiarComida(ci, "nombre_comida", e.target.value)
                  }
                />
              </label>
              <label>
                Tipo
                <select
                  value={c.tipo_comida}
                  onChange={(e) =>
                    cambiarComida(ci, "tipo_comida", e.target.value)
                  }
                >
                  {["desayuno", "almuerzo", "merienda", "cena", "colacion"].map(
                    (t) => (
                      <option key={t}>{t}</option>
                    ),
                  )}
                </select>
              </label>
              {esDieta && (
                <label>
                  Hora
                  <input
                    required
                    type="time"
                    value={c.hora}
                    onChange={(e) => cambiarComida(ci, "hora", e.target.value)}
                  />
                </label>
              )}
            </div>
            <p className="muted">
              Nutrientes por 100 g / 100 ml; si elegís porción, por una porción.
              Cantidad es lo que se come.
            </p>
            {c.alimentos.map((a, ai) => (
              <div className="alimento" key={ai}>
                <div className="grilla tres">
                  <label>
                    Alimento
                    <input
                      required
                      maxLength={150}
                      value={a.nombre}
                      onChange={(e) =>
                        cambiarAlimento(ci, ai, "nombre", e.target.value)
                      }
                    />
                  </label>
                  <label>
                    Cantidad
                    <input
                      required
                      type="number"
                      min="0.01"
                      max="10000"
                      step="0.01"
                      value={a.cantidad}
                      onChange={(e) =>
                        cambiarAlimento(
                          ci,
                          ai,
                          "cantidad",
                          Number(e.target.value),
                        )
                      }
                    />
                  </label>
                  <label>
                    Unidad
                    <select
                      value={a.unidad}
                      onChange={(e) =>
                        cambiarAlimento(ci, ai, "unidad", e.target.value)
                      }
                    >
                      <option value="g">g</option>
                      <option value="ml">ml</option>
                      <option value="porcion">porciones</option>
                    </select>
                  </label>
                </div>
                <div className="grilla cuatro">
                  {[
                    ["calorias", "kcal"],
                    ["proteinas_g", "Proteínas (g)"],
                    ["carbohidratos_g", "Carbohidratos (g)"],
                    ["grasas_g", "Grasas (g)"],
                  ].map(([campo, titulo]) => (
                    <label key={campo}>
                      {titulo}
                      <input
                        required
                        type="number"
                        min="0"
                        max={campo === "calorias" ? 10000 : 1000}
                        step="0.01"
                        value={a[campo]}
                        onChange={(e) =>
                          cambiarAlimento(ci, ai, campo, Number(e.target.value))
                        }
                      />
                    </label>
                  ))}
                </div>
                <button
                  type="button"
                  className="secundario"
                  disabled={c.alimentos.length === 1}
                  onClick={() => quitarAlimento(ci, ai)}
                >
                  Quitar alimento
                </button>
              </div>
            ))}
            <button
              type="button"
              className="secundario"
              disabled={c.alimentos.length >= 30}
              onClick={() => agregarAlimento(ci)}
            >
              ＋ Alimento
            </button>
            {esDieta && (
              <button
                type="button"
                className="secundario"
                disabled={datos.comidas.length === 1}
                onClick={() => quitarComida(ci)}
              >
                Quitar comida
              </button>
            )}
          </fieldset>
        ))}
        <div className="acciones">
          {esDieta && (
            <button
              type="button"
              className="secundario"
              disabled={datos.comidas.length >= 15}
              onClick={() => agregarComida()}
            >
              ＋ Comida
            </button>
          )}
          <button disabled={ocupado}>
            Guardar {esDieta ? "dieta" : "consumo"}
          </button>
          {editando && (
            <button type="button" className="secundario" onClick={limpiar}>
              Cancelar edición
            </button>
          )}
        </div>
      </form>
      <h2>{esDieta ? "Mis dietas" : "Consumos del día"}</h2>
      {!items.length && <p className="vacio">Todavía no hay registros.</p>}
      {items.map((item) => (
        <article className="tarjeta" key={item.id}>
          <h3>{esDieta ? item.nombre : item.nombre_comida}</h3>
          {esDieta ? (
            <>
              <p>{item.descripcion}</p>
              {item.comidas.map((c) => (
                <div key={c.id}>
                  <p>
                    {c.hora} · {c.nombre_comida} · {c.calorias} kcal · P{" "}
                    {c.proteinas_g} g / C {c.carbohidratos_g} g / G {c.grasas_g}{" "}
                    g
                  </p>
                  <ul>
                    {c.alimentos.map((a, i) => (
                      <li key={i}>
                        {a.nombre}: {a.cantidad} {a.unidad}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </>
          ) : (
            <p>
              {new Date(item.fecha_consumo).toLocaleString("es-AR", {
                timeZone: usuario.zona_horaria,
                hour12: false,
              })}{" "}
              · {item.calorias_totales} kcal · P {item.proteinas_totales_g} g /
              C {item.carbohidratos_totales_g} g / G {item.grasas_totales_g} g
            </p>
          )}
          <div className="acciones">
            <button onClick={() => editar(item)}>Editar</button>
            <button className="secundario" onClick={() => eliminar(item)}>
              {esDieta ? "Dar de baja" : "Eliminar"}
            </button>
          </div>
        </article>
      ))}
    </main>
  );
}
