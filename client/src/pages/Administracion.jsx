import { useEffect, useState } from "react";
import axios from "axios";
import Confirmar from "../components/Confirmar";
const usuarioNuevo = () => ({
  nombre: "",
  apellido: "",
  email: "",
  password: "",
});
export default function Administracion({ usuario }) {
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [datos, setDatos] = useState(usuarioNuevo);
  const [editando, setEditando] = useState(null);
  const [rolNombre, setRolNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [permisos, setPermisos] = useState([]);
  const [rolId, setRolId] = useState(null);
  const [usuarioRoles, setUsuarioRoles] = useState("");
  const [seleccion, setSeleccion] = useState([]);
  const [aviso, setAviso] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [confirmacion, setConfirmacion] = useState(null);
  function puede(permiso) {
    return usuario.administrador || usuario.permisos.includes(permiso);
  }
  async function cargar() {
    try {
      if (puede("usuarios:ver"))
        setUsuarios(
          (await axios.get("/admin/usuarios", { params: { q: busqueda } })).data
            .items,
        );
      if (puede("roles:gestionar"))
        setRoles((await axios.get("/admin/roles")).data.items);
      if (puede("auditoria:ver"))
        setEventos((await axios.get("/admin/bitacora")).data.items);
    } catch (error) {
      mostrarError(error);
    }
  }
  useEffect(() => {
    cargar();
  }, []);
  function mostrarError(error) {
    if (error.response && error.response.data)
      setAviso(error.response.data.message);
    else setAviso("No se pudo conectar con el servidor.");
  }
  function cambiarDato(campo, valor) {
    const copia = {
      nombre: datos.nombre,
      apellido: datos.apellido,
      email: datos.email,
      password: datos.password,
    };
    copia[campo] = valor;
    setDatos(copia);
  }
  async function guardarUsuario(e) {
    e.preventDefault();
    setOcupado(true);
    setAviso("");
    try {
      if (editando) await axios.put("/admin/usuarios/" + editando, datos);
      else await axios.post("/admin/usuarios", datos);
      setEditando(null);
      setDatos(usuarioNuevo());
      await cargar();
      setAviso("Usuario guardado.");
    } catch (error) {
      mostrarError(error);
    } finally {
      setOcupado(false);
    }
  }
  function editarUsuario(item) {
    setEditando(item.id);
    setDatos({
      nombre: item.nombre,
      apellido: item.apellido || "",
      email: item.email,
      password: "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function marcar(lista, valor) {
    const copia = [];
    for (let i = 0; i < lista.length; i++)
      if (lista[i] !== valor) copia.push(lista[i]);
    if (!lista.includes(valor)) copia.push(valor);
    return copia;
  }
  async function guardarRol(e) {
    e.preventDefault();
    setOcupado(true);
    try {
      const cuerpo = { nombre: rolNombre, descripcion, permisos };
      if (rolId) await axios.put("/admin/roles/" + rolId, cuerpo);
      else await axios.post("/admin/roles", cuerpo);
      setRolId(null);
      setRolNombre("");
      setDescripcion("");
      setPermisos([]);
      await cargar();
      setAviso("Rol guardado.");
    } catch (error) {
      mostrarError(error);
    } finally {
      setOcupado(false);
    }
  }
  async function ejecutar() {
    const accion = confirmacion;
    setConfirmacion(null);
    setOcupado(true);
    try {
      if (accion.tipo === "estado")
        await axios.patch("/admin/usuarios/" + accion.id + "/estado", {
          estado: accion.estado,
          confirmar: true,
        });
      if (accion.tipo === "usuario")
        await axios.delete("/admin/usuarios/" + accion.id, {
          data: { confirmar: true },
        });
      if (accion.tipo === "rol")
        await axios.delete("/admin/roles/" + accion.id, {
          data: { confirmar: true },
        });
      if (accion.tipo === "asignar")
        await axios.put("/admin/usuarios/" + usuarioRoles + "/roles", {
          roles: seleccion,
          confirmar: true,
        });
      await cargar();
      setAviso("Operación realizada.");
    } catch (error) {
      mostrarError(error);
    } finally {
      setOcupado(false);
    }
  }
  return (
    <main>
      <p className="etiqueta">GESTIÓN DEL SISTEMA</p>
      <h1>Administración</h1>
      <p>
        Usuarios, roles y últimos 100 eventos. Los permisos se verifican también
        en el servidor.
      </p>
      {aviso && (
        <p role="status" className="aviso">
          {aviso}
        </p>
      )}
      {confirmacion && (
        <Confirmar
          texto={confirmacion.texto}
          onAceptar={ejecutar}
          onCancelar={() => setConfirmacion(null)}
        />
      )}
      {puede("usuarios:editar") && (
        <form className="tarjeta" onSubmit={guardarUsuario}>
          <h2>{editando ? "Editar usuario" : "Crear usuario"}</h2>
          <div className="grilla dos">
            <label>
              Nombre
              <input
                required
                minLength={2}
                maxLength={100}
                value={datos.nombre}
                onChange={(e) => cambiarDato("nombre", e.target.value)}
              />
            </label>
            <label>
              Apellido
              <input
                maxLength={100}
                value={datos.apellido}
                onChange={(e) => cambiarDato("apellido", e.target.value)}
              />
            </label>
            <label>
              Correo electrónico
              <input
                required
                type="email"
                maxLength={150}
                value={datos.email}
                onChange={(e) => cambiarDato("email", e.target.value)}
              />
            </label>
            {!editando && (
              <label>
                Contraseña inicial
                <input
                  required
                  type="password"
                  minLength={10}
                  maxLength={72}
                  autoComplete="new-password"
                  value={datos.password}
                  onChange={(e) => cambiarDato("password", e.target.value)}
                />
              </label>
            )}
          </div>
          <div className="acciones">
            <button disabled={ocupado}>Guardar usuario</button>
            {editando && (
              <button
                type="button"
                className="secundario"
                onClick={() => {
                  setEditando(null);
                  setDatos(usuarioNuevo());
                }}
              >
                Cancelar edición
              </button>
            )}
          </div>
        </form>
      )}
      {puede("usuarios:ver") && (
        <section className="tarjeta">
          <h2>Usuarios</h2>
          <form
            className="acciones"
            onSubmit={(e) => {
              e.preventDefault();
              cargar();
            }}
          >
            <label>
              Buscar por nombre o correo
              <input
                value={busqueda}
                maxLength={100}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </label>
            <button disabled={ocupado}>Buscar</button>
          </form>
          <p className="muted">Hasta 200 resultados por búsqueda.</p>
          {!usuarios.length && <p>Sin usuarios para mostrar.</p>}
          {usuarios.map((item) => (
            <article className="tarjeta" key={item.id}>
              <h3>
                {item.nombre} {item.apellido}
              </h3>
              <p>
                {item.email} · {item.estado}
              </p>
              <p>Roles: {item.roles.map((r) => r.nombre).join(", ")}</p>
              {puede("usuarios:editar") && (
                <div className="acciones">
                  <button onClick={() => editarUsuario(item)}>
                    Editar usuario
                  </button>
                  <button
                    className="secundario"
                    disabled={ocupado || item.id === usuario.id}
                    onClick={() =>
                      setConfirmacion({
                        tipo: "estado",
                        id: item.id,
                        estado:
                          item.estado === "activo" ? "bloqueado" : "activo",
                        texto:
                          "¿Cambiar el estado de " +
                          item.email +
                          "? Al bloquear se cierran sus sesiones.",
                      })
                    }
                  >
                    {item.estado === "activo" ? "Bloquear" : "Activar"}
                  </button>
                  <button
                    className="destructivo"
                    disabled={ocupado || item.id === usuario.id}
                    onClick={() =>
                      setConfirmacion({
                        tipo: "usuario",
                        id: item.id,
                        texto:
                          "¿Eliminar a " +
                          item.email +
                          " y sus datos? No se puede deshacer.",
                      })
                    }
                  >
                    Eliminar usuario
                  </button>
                </div>
              )}
              {puede("roles:gestionar") && (
                <button
                  className="secundario"
                  onClick={() => {
                    setUsuarioRoles(item.id);
                    const ids = [];
                    for (let i = 0; i < item.roles.length; i++)
                      ids.push(item.roles[i].id);
                    setSeleccion(ids);
                  }}
                >
                  Asignar roles
                </button>
              )}
            </article>
          ))}
        </section>
      )}
      {puede("roles:gestionar") && (
        <section className="tarjeta">
          <h2>Roles y permisos</h2>
          {usuarioRoles && (
            <div className="tarjeta">
              <h3>Roles del usuario seleccionado</h3>
              {roles.map((r) => (
                <label className="check" key={r.id}>
                  <input
                    type="checkbox"
                    checked={seleccion.includes(r.id)}
                    onChange={() => setSeleccion(marcar(seleccion, r.id))}
                  />
                  {r.nombre}
                </label>
              ))}
              <button
                disabled={ocupado || !seleccion.length}
                onClick={() =>
                  setConfirmacion({
                    tipo: "asignar",
                    texto:
                      "¿Reemplazar los roles y cerrar las sesiones de esta cuenta?",
                  })
                }
              >
                Confirmar asignación
              </button>
              <button
                className="secundario"
                onClick={() => setUsuarioRoles("")}
              >
                Cancelar asignación
              </button>
            </div>
          )}
          <form onSubmit={guardarRol}>
            <h3>{rolId ? "Editar rol" : "Crear rol"}</h3>
            <label>
              Nombre del rol
              <input
                required
                minLength={2}
                maxLength={50}
                value={rolNombre}
                onChange={(e) => setRolNombre(e.target.value)}
              />
            </label>
            <label>
              Descripción del rol
              <input
                maxLength={255}
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
              />
            </label>
            {[
              "usuarios:ver",
              "usuarios:editar",
              "roles:gestionar",
              "auditoria:ver",
            ].map((p) => (
              <label className="check" key={p}>
                <input
                  type="checkbox"
                  checked={permisos.includes(p)}
                  onChange={() => setPermisos(marcar(permisos, p))}
                />
                {p}
              </label>
            ))}
            <button disabled={ocupado}>Guardar rol</button>
            <button
              className="secundario"
              type="button"
              onClick={() => {
                setRolId(null);
                setRolNombre("");
                setDescripcion("");
                setPermisos([]);
              }}
            >
              Cancelar rol
            </button>
          </form>
          {roles.map((r) => (
            <article className="tarjeta" key={r.id}>
              <h3>{r.nombre}</h3>
              <p>{r.descripcion}</p>
              <p>{r.permisos.join(", ") || "Sin permisos administrativos"}</p>
              {r.sistema ? (
                <small>Rol del sistema protegido.</small>
              ) : (
                <div className="acciones">
                  <button
                    onClick={() => {
                      setRolId(r.id);
                      setRolNombre(r.nombre);
                      setDescripcion(r.descripcion || "");
                      setPermisos(r.permisos);
                    }}
                  >
                    Editar rol
                  </button>
                  <button
                    disabled={ocupado}
                    className="secundario"
                    onClick={() =>
                      setConfirmacion({
                        tipo: "rol",
                        id: r.id,
                        texto:
                          "¿Eliminar el rol " +
                          r.nombre +
                          "? Solo se permite si no está asignado.",
                      })
                    }
                  >
                    Eliminar rol
                  </button>
                </div>
              )}
            </article>
          ))}
        </section>
      )}
      {puede("auditoria:ver") && (
        <section className="tarjeta">
          <h2>Bitácora</h2>
          {!eventos.length && <p>Sin eventos.</p>}
          {eventos.map((e) => (
            <p key={e.id}>
              {new Date(e.fecha_hora).toLocaleString("es-AR")} · {e.modulo} ·{" "}
              {e.accion} · {e.resultado}
            </p>
          ))}
        </section>
      )}
    </main>
  );
}
