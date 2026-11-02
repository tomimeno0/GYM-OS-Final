# API final

Prefijo /api. JSON en escrituras. La cookie HttpOnly gymos100 conserva la sesión. Los endpoints administrativos verifican permisos en backend. Códigos: 200/201/204 éxito, 400 datos, 401 sesión, 403 permiso, 404 recurso, 409 conflicto, 500 error interno y 503 dependencia.

La tabla completa con responsable por método/ruta está en [guias/README.md](../guias/README.md); las guías explican entradas y funciones.

## Endpoints añadidos al cierre

| Método y ruta | Entrada | Resultado principal |
| --- | --- | --- |
| PUT /api/cuenta/password | actual, nueva | Cambia bcrypt y revoca sesiones/recuperaciones; 200, 400, 403 o 500. |
| POST /api/recuperar-password | email | Solicitud uniforme y envío SMTP; 200, 400 o 503. |
| POST /api/restablecer-password | token, password | Requiere token válido no usado y no vencido; 200, 400 o 500. |
| POST /api/ia/dietas | preferencias, confirmar:true | Consentimiento, medidas y meta activa; JSON validado y 201. |
| POST /api/ia/dietas/:id/adaptar | preferencias, confirmar:true | Dieta activa propia; reemplazo atómico y 200. |
| GET /api/admin/usuarios | query q opcional | Lista pública limitada a 200 y roles; permiso usuarios:ver. |
| POST /api/admin/usuarios | nombre, apellido, email, password | Alta con rol Cliente sin abrir sesión; permiso usuarios:editar; 201. |
| PUT /api/admin/usuarios/:id | nombre, apellido, email | Edición de datos; permiso usuarios:editar; 200/400/404/409. |
| PATCH /api/admin/usuarios/:id/estado | estado:activo o bloqueado, confirmar:true | Revoca sesiones al bloquear y protege último admin; 200/400/404/409. |
| DELETE /api/admin/usuarios/:id | confirmar:true | Borra usuario y datos; protege autoeliminación/último admin; 204/400/404/409. |
| GET /api/admin/roles | Sin body | Roles y permisos válidos; roles:gestionar. |
| POST /api/admin/roles | nombre, descripcion, permisos | Crear rol personalizado; roles:gestionar; 201/400/409. |
| PUT /api/admin/roles/:id | nombre, descripcion, permisos | Editar sin modificar roles del sistema; 200/400/404/409. |
| DELETE /api/admin/roles/:id | confirmar:true | Solo personalizados no asignados; 204/400/404/409. |
| PUT /api/admin/usuarios/:id/roles | roles:[ids], confirmar:true | Reemplazo validado y revocación de sesiones; roles:gestionar; 200/400/404/409. |
| GET /api/admin/bitacora | Sin body | 100 últimos eventos; auditoria:ver. |

Administrador tiene acceso completo. Los permisos personalizados se aplican por endpoint. Un usuario sin la autorización recibe 403, y sin sesión recibe 401. Los nombres y entradas de cada recorrido heredado están en la guía de su responsable.

## POST /api/login · protección por intentos

Se mantiene email/password. Los cuatro primeros fallos responden 401; el quinto inicia bloqueo de 15 minutos y devuelve 429 con Retry-After y retry_after_segundos. Durante el bloqueo también se rechaza la contraseña correcta con 429. Un acceso válido o una recuperación/cambio de contraseña limpia el contador. No equivale al bloqueo administrativo. Ver la guía de Gianluca.
