# GYM-OS · entrega final

Aplicación educativa de entrenamiento, objetivos, rutinas, nutrición y asistencia por IA, con cuentas y administración por roles. JavaScript, React + Vite, Express, Sequelize y MySQL. Deriva del corte [75 %](https://github.com/tomimeno0/GYM-OS-Preentrega-75) y conserva su lógica y reparto, ampliados para la entrega final.

## Instalación

Requiere Node.js 22.12 o posterior, npm, Docker con Compose y puertos 5176, 3312, 1026 y 8026 libres.

1. Ejecutar `npm ci` y `npm ci --prefix client`.
2. Copiar `.env.example` a `.env`. Completar las credenciales MySQL, un `JWT_SECRET` aleatorio de al menos 32 caracteres y `ENCRYPTION_KEY` con 64 caracteres hexadecimales. `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"` permite generar cada secreto por separado.
3. Ejecutar `docker compose up -d` (o `docker-compose up -d` si Compose está instalado como comando separado). Esperar a que MySQL esté saludable con `docker compose ps`. En esta Mac se usa el contexto `colima-gymos`.
4. Ejecutar `npm run db:iniciar`. Crea tablas/roles sin borrar datos. Opcional: configurar `ADMIN_EMAIL` y `ADMIN_PASSWORD`, y ejecutar `npm run admin:crear`.
5. Ejecutar `npm run build` y `npm start`.
6. Abrir http://localhost:5176. El servidor responde en loopback IPv4/IPv6. Estado de MySQL: http://localhost:5176/api/salud.

La base tiene volumen independiente del 75 %. No se incluyen credenciales reales ni los PDF privados. Para una cuenta demostración, configurar `DEMO_PASSWORD` antes de `db:iniciar`; su correo es `demo@gymos.local`.

## Carpetas

- `backend/index.js`: Express, rutas y archivos estáticos.
- `backend/config/`: conexión, inicialización y creación de administrador.
- `backend/routes/`, `backend/controllers/`, `backend/models/`: arquitectura del curso, sin capa de servicios.
- `client/src/`: React, formularios, navegación, componentes y estilos.
- `guias/`: exactamente nueve guías individuales con diagramas y preguntas.
- `docs/`: manual, requisitos, API, defensa y validación.

## Correo e IA

La recuperación funciona con enlaces de 15 minutos y uso único. Para demostrarla localmente, el servicio `correo` de Compose recibe SMTP en 1026 y muestra el buzón en http://localhost:8026. Configurar `SMTP_HOST=127.0.0.1`, `SMTP_PORT=1026`, `SMTP_SECURE=false`, `SMTP_FROM=no-reply@gymos.local` y `APP_URL=http://localhost:5176`. Mailpit captura correo local: no entrega a Gmail/Outlook. Para envío externo, usar las variables SMTP del proveedor; 465 suele usar `SMTP_SECURE=true`, 587 usa STARTTLS. No desactivar validación de certificados.

Para chat y generación/adaptación de rutinas/dietas, configurar `COHERE_API_KEY` y `COHERE_MODEL` (se verificó `command-r-08-2024`) en `.env`. Cada cuenta debe habilitar consentimiento en Mi cuenta. El backend llama a Cohere por API y valida el JSON antes de guardar. No hay modelos locales ni respuestas de reemplazo que aparenten ser IA. Fallos del proveedor se muestran como error sin dar por guardada una propuesta.

## Documentación

[Manual de usuario](docs/MANUAL-USUARIO.md) · [Nueve guías y reparto](guias/README.md) · [Conceptos comunes de defensa](docs/BASE-COMUN.md) · [Requisitos de entrega](docs/REQUISITOS-ENTREGA.md) · [API](docs/API.md) · [Verificación](docs/VERIFICACION.md) · [Guion de presentación](docs/PRESENTACION.md).

«100 %» identifica el alcance funcional final. No es una promesa de nota máxima ni de ausencia total de errores. Se mantienen las exclusiones previas de DVH/DVV y controles especiales de origen; esta configuración está preparada para demostración local. No publicar la instancia local con usuarios reales sin revisar despliegue y seguridad. La explicación de diferencias con UML/DER está en el alcance.

## Bloqueo temporal del login

Desde el 2/11/2026: cinco contraseñas incorrectas consecutivas bloquean nuevos inicios de sesión de esa cuenta durante 15 minutos. El quinto fallo y las solicitudes durante el bloqueo responden 429 con Retry-After. Un acierto reinicia el contador; 15 minutos sin fallos también reinician su ventana. Los datos se guardan en MySQL y sobreviven a un reinicio. El bloqueo manual del administrador es independiente.

Si ya existía la base, ejecutar `npm run db:actualizar-login` y reiniciar el servidor. La actualización agrega únicamente las tres columnas que falten, sin borrar usuarios; `db:iniciar` también la ejecuta. Una instalación nueva ya crea esos campos. Responsable del recorrido y defensa: Gianluca Pizarro, en su guía individual.
