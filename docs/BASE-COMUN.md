# Base común de defensa · lectura breve para todos

El PDF del profesor indica una defensa individual de 15–20 minutos y permite preguntar cualquier parte del código, incluso de un compañero. La guía propia prepara en profundidad el módulo asignado. Esta base permite ubicar el resto sin memorizar todas sus funciones. Las respuestas son orientativas: probalas con el código abierto y decilas con tus palabras.

## 1. Organización

`client/src/pages` tiene pantallas React. `App.jsx` publica las rutas y mantiene el usuario conectado. `backend/routes` conecta método HTTP y URL con una función; `controllers` valida y ejecuta la operación; `models` describe tablas y relaciones Sequelize; `config/db.js` conecta MySQL. `backend/index.js` monta `/api` y sirve el build de React. No hay capa de servicios.

## 2. Del login al token

1. Acceso.jsx conserva email/password con useState. `enviar` evita el submit del navegador y llama `axios.post('/login', datos)`; Axios tiene baseURL `/api`.
2. Express lee JSON y ejecuta `iniciarSesion` en usuarios.controller.js.
3. Sequelize busca Usuario activo por correo normalizado. bcrypt.compare comprueba la contraseña contra el hash; no se descifra nada.
4. `abrirSesion` firma un JWT con id, vencimiento y jti; guarda solo SHA-256 del token en Sesion, con su fecha de expiración.
5. El servidor envía `Set-Cookie: gymos100=...; HttpOnly; SameSite=Lax` y JSON con el usuario público y sus permisos. La respuesta no expone el hash de contraseña.
6. El navegador manda la cookie en llamadas posteriores. React guarda los datos públicos, no el token. Al recargar, App llama GET /api/cuenta y recupera al usuario.
7. `verificarSesion` comprueba firma, vencimiento, Sesion existente y Usuario activo. Logout, bloqueo o cambio de contraseña borran sesiones y revocan los tokens anteriores.

## 3. Conceptos que todos deben poder explicar

| Concepto | Qué hace aquí | Qué no confundir |
| --- | --- | --- |
| Node.js | Ejecuta JavaScript del servidor. | No es la base de datos. |
| Express | Recibe peticiones y conecta rutas/middlewares/controladores. | Una ruta de React no es una ruta de API. |
| Sequelize | Modelos, relaciones y consultas SQL sobre MySQL. | `where` filtra en la consulta; no es una lista en memoria. |
| Bcrypt | Hash irreversible con salt y comparación de contraseña. | No es AES ni permite recuperar texto original. |
| JWT | Token firmado con identidad y expiración. | No guarda toda la base y su payload no es secreto cifrado. |
| Middleware | Función `(req,res,next)` ejecutada antes del handler. | Si responde error no debe ejecutar next después. |
| Roles y permisos | Controlan qué rutas administrativas puede usar una cuenta. | Ocultar un botón no autoriza una petición. |
| CORS | Regla del navegador para permitir lecturas entre orígenes distintos. | No es un reemplazo de autenticación. No se instala CORS aquí: el build y `/api` comparten origen; Vite usa proxy en desarrollo. |
| useState | Conserva estado React y permite re-renderizar al actualizarlo. | No persiste datos al cerrar el navegador ni escribe SQL. |
| useEffect | Ejecuta la carga inicial de datos al montar la pantalla. | No se deben disparar POST repetidos desde el render. |
| Axios | Cliente HTTP usado por React para llamar al backend. | No conecta directamente a MySQL. |
| Transacción | Confirma o revierte un conjunto de cambios. | try/catch por sí solo no deshace consultas anteriores. |
| Cookie HttpOnly | El navegador envía el token y JavaScript no puede leerlo. | No asegura por sí sola toda la aplicación. |
| API externa | Cohere devuelve propuestas y respuestas. | El modelo puede fallar; se valida antes de persistir. |

## 4. Cómo leer una función durante la defensa

Ubicá qué recibe (`req.params`, `req.query`, `req.body`, `req.user`), cuáles son las validaciones, qué modelo consulta, cómo limita a datos propios y qué respuesta envía. En React ubicá qué estado cambia, qué evento dispara la petición y qué se muestra al terminar o fallar. No hace falta narrar cada símbolo, sí cada decisión.

Códigos usados: 200 éxito, 201 creado, 204 sin contenido, 400 datos inválidos, 401 sesión ausente/inválida, 403 sin permiso, 404 recurso inexistente/no propio, 409 conflicto de estado, 500 error interno y 503 dependencia no disponible.

## 5. Ejercicio común de cinco minutos

Abrí tu pantalla, señalá su componente, encontrá la llamada Axios y la ruta Express, pasá al controlador y al modelo y mostrale al profesor la respuesta en la interfaz. Explicá qué pasaría con datos de otra cuenta o datos inválidos. Si no sabés una parte, ubicá el archivo correcto y reconocé el límite antes de inventar una explicación.

## Actualización: login protegido por intentos

El responsable es Gianluca. Antes de comparar bcrypt, iniciarSesion verifica el bloqueo temporal en MySQL. Cinco errores bloquean nuevos accesos 15 minutos y producen 429 con Retry-After; un error anterior produce 401. El contador se actualiza bajo transacción y bloqueo de fila. No se confunde con estado=bloqueado, que es una decisión administrativa. Ver la guía de Gianluca para el detalle y diagrama.
