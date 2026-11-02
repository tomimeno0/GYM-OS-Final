# Manual de usuario · GYM-OS final

## Acceso y requisitos

Una vez iniciado el sistema, abrir http://localhost:5176 en navegador de escritorio o móvil conectado a la misma instancia. Esta instalación escucha solo en la Mac: otra computadora no puede entrar usando su propio localhost. React funciona con teclado; los formularios muestran validaciones y mensajes. Para arrancar desde cero, seguir el README.

## 1. Crear una cuenta e iniciar sesión

En la portada, pulsar Crear cuenta. Ingresar nombre de al menos dos caracteres, apellido opcional, correo válido y contraseña de al menos diez caracteres (máximo 72 bytes). El correo debe ser único. Crear mi cuenta lleva al Resumen. Si la cuenta ya existe, usar Iniciar sesión con correo y contraseña. Una cuenta bloqueada no puede ingresar. Cerrar sesión abre una confirmación: cancelar conserva la sesión y confirmar vuelve al inicio.

## 2. Recuperar o cambiar contraseña

Sin sesión, pulsar Olvidé mi contraseña, ingresar correo y Enviar enlace. Si existe una cuenta activa, se envía un enlace de 15 minutos. En la instalación demostrativa abrir el buzón http://localhost:8026: el mensaje se captura localmente, no llega al buzón externo del correo indicado. Con SMTP de un proveedor, revisar el correo habitual y spam. Abrir el enlace, ingresar la nueva contraseña dos veces y guardar. Un enlace usado o vencido exige pedir otro. No compartir el enlace.

Con sesión, entrar en Mi cuenta, sección Cambiar contraseña: ingresar la actual, nueva y repetición. Al guardar se cierran todas las sesiones; volver al login con la nueva. Si la actual es incorrecta no cambia nada.

## 3. Mi cuenta

Editar nombre, apellido, teléfono, fecha de nacimiento, género y zona horaria. Guardar perfil confirma la persistencia. El correo del usuario se muestra pero se cambia solo desde el panel con permiso de edición. El teléfono se guarda cifrado. La casilla de consentimiento habilita enviar a Cohere consultas y contexto reducido para propuestas; se puede desmarcar y guardar para retirarlo.

Eliminar mi cuenta exige contraseña y una confirmación. Cancelar no borra nada. Confirmar elimina la cuenta y los datos asociados, y cierra la sesión; es irreversible. Una cuenta administradora debe ser eliminada por otro administrador desde el panel para proteger el acceso al sistema.

## 4. Medidas y progreso

Abrir Medidas y progreso. Cargar peso, altura, grasa, músculo y actividad. Los porcentajes opcionales pueden quedar vacíos. El primer registro se carga una vez; las actualizaciones se guardan en historial. No se permiten fechas futuras ni valores fuera de rango. Resumen muestra el gráfico y contadores. Si no hay datos, usar los enlaces para cargarlos.

## 5. Objetivos

Registrar medidas primero. En Objetivos completar nombre, tipo de meta, valor, frecuencia semanal y fechas. El formulario indica la unidad según el tipo: kg, %, km o entrenamientos. Solo se permite una meta activa. La meta de bajar peso debe ser menor al peso actual; la de ganar masa debe ser mayor. Completar o dar de baja requiere confirmación; cancelar no cambia la meta. La meta completada conserva su progreso al cierre.

## 6. Rutinas

En Rutinas crear un plan manual con nombre, descripción, objetivo opcional y ejercicios. El catálogo permite buscar nombre/grupo y avanzar por páginas. Agregar un ejercicio, elegir día 1–7, series, repeticiones, peso y descanso. Se admiten ejercicios manuales por nombre. Guardar valida el conjunto; Editar carga el plan existente y permite quitar/agregar ejercicios. Dar de baja requiere confirmación y no elimina entrenamientos históricos.

Para generar una rutina IA, tener medidas, objetivo activo y consentimiento. Ingresar preferencias y confirmar el envío a Cohere. Se guarda una propuesta editable. Adaptar requiere una rutina propia activa y mantiene su id. Revisar antes de entrenar; no usar como diagnóstico ni tratamiento.

## 7. Entrenamientos

Elegir rutina y día. Iniciar copia los ejercicios al registro del entrenamiento. Completar series, repeticiones y peso realmente utilizado; marcar los realizados. Guardar en curso permite continuar después. Finalizar, dejar incompleto o cancelar cambia el estado según el formulario y su confirmación. No puede haber dos entrenamientos en curso para la misma cuenta. El historial conserva la copia de ejercicios aunque la rutina se edite.

## 8. Dietas manuales y por IA

Una dieta planifica comidas; no registra un consumo real. En Dietas crear nombre, descripción, metas de calorías/macros y objetivo opcional. Agregar comidas con tipo y hora, y alimentos con nombre, cantidad y unidad. Los nutrientes se ingresan **por 100 g/100 ml**, o **por una porción** si se elige porción. Guardar persiste comidas y plan juntos. Editar conserva el id. Dar de baja conserva los consumos.

Para IA, completar preferencias y elegir Crear una dieta nueva o una dieta a adaptar. Confirmar el envío de contexto a Cohere. Se necesitan medidas, objetivo y consentimiento. Durante Generando propuesta esperar; un fallo muestra error y no se anuncia como éxito. La lista muestra alimentos y cantidades para revisar. Una adaptación reemplaza las comidas del plan seleccionado. La propuesta es orientación general para adultos sanos; las condiciones médicas se consultan con un profesional.

## 9. Consumos y macros

Registrar lo realmente comido con fecha/hora, tipo, alimentos y cantidades. La fecha vacía usa el momento actual; no se permite futuro. Por ejemplo, 50 g de un alimento con 400 kcal por 100 g aporta 200 kcal. Editar conserva el registro y recalcula; eliminar exige confirmación. Elegir el día a consultar muestra los totales y las metas de la dieta activa más reciente. El día se calcula con la zona horaria del perfil.

## 10. Asistente

Elegir Entrenador o Soporte y escribir una consulta. Activar consentimiento antes si se solicita. Las conversaciones se guardan por usuario y modo, y pueden reabrirse. El chat orienta pero no ejecuta acciones en la cuenta ni consulta datos privados por su cuenta. Si Cohere no responde, se muestra un aviso y no se inventa una respuesta.

## 11. Administración

El enlace aparece según roles/permisos. El backend comprueba cada operación aunque alguien escriba la URL manualmente.

- Usuarios: buscar por nombre/correo, hasta 200 resultados. Crear exige nombre, correo y contraseña inicial. Editar modifica nombre, apellido y correo; no reemplaza contraseña ni sesión del admin.
- Bloquear cierra las sesiones y deshabilita login. Activar permite volver a entrar. Confirmar cada cambio. No se puede deshabilitar el último administrador activo.
- Eliminar usuario borra datos y no es reversible. No se permite autoeliminación desde el panel.
- Roles: crear nombre/descripcion y permisos; editar preserva el id. Cliente y Administrador son protegidos. Eliminar solo un rol personalizado sin usuarios asignados.
- Asignar roles: elegir un usuario, marcar uno o más roles y confirmar; se reemplazan asignaciones y se cierran las sesiones de esa cuenta. Cancelar no escribe cambios. Nunca se permite dejar el sistema sin administrador activo.
- Bitácora: muestra los 100 eventos recientes; no contiene contraseñas, tokens ni texto de chat. No es un registro exhaustivo de todos los errores.

## 12. Mensajes y soluciones

| Mensaje/situación | Acción |
| --- | --- |
| Primero registrá medidas y objetivo | Completar ambos antes de pedir planes IA. |
| Correo ya registrado | Usar login o recuperar, no crear otra cuenta igual. |
| La sesión venció | Volver al login. También ocurre al cambiar contraseña, roles o bloquear. |
| Sin permiso | Ingresar con cuenta autorizada; ocultar un botón no cambia los permisos. |
| SMTP no configurado o envío fallido | Revisar `.env`, servicio correo y APP_URL; no se genera enlace público como reemplazo. |
| Cohere no pudo responder | Revisar conexión, clave/modelo y volver a intentar; verificar que no se haya creado un registro antes de repetir. |
| No carga la app | Iniciar servidor, MySQL y comprobar `/api/salud`; seguir README. |

## Datos y privacidad de la demostración

Usar datos ficticios. El buzón local permite ver todos los mensajes de esta instalación y está limitado a loopback. No publicar credenciales, backups ni enlaces de recuperación en el repositorio. Los GIF/imágenes de ejercicios no se redistribuyen; el catálogo textual incluye atribución en backend/models/exercises.

## Demasiados intentos de contraseña

Tras cinco contraseñas incorrectas consecutivas, la cuenta no podrá iniciar otra sesión durante 15 minutos. Se muestra el mensaje correspondiente; intentar desde otra pestaña o con otra combinación de mayúsculas del correo no evita el bloqueo. Los intentos durante la espera no extienden el plazo. Después se puede volver a intentar. Si necesitás recuperar el acceso, utilizá Olvidé mi contraseña y un enlace válido del correo.

Este bloqueo temporal no equivale al bloqueo manual del administrador. El manual no se levanta al esperar 15 minutos. Las sesiones abiertas antes de los fallos continúan disponibles; desde Mi cuenta se puede cambiar la contraseña si se conoce la actual, lo que cierra esas sesiones y limpia el bloqueo temporal.
