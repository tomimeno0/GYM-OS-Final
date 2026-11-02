# Verificación de la entrega final · 30/10/2026

Entorno independiente del 75 %: MySQL 8.4, base gym_os_final, servidor Express en 5176, SMTP local real Mailpit y Cohere por API. Datos de prueba sintéticos. No se usaron respuestas fijas para presentar como real el proveedor de IA.

## Resultado funcional

- Regresión de módulos heredados: **35 peticiones HTTP**, 10 comprobaciones de cuentas/perfil, cifrado de teléfono, medidas, metas, rutinas, entrenamientos, nutrición, cálculo, aislamiento, borrado y conversación con Cohere real.
- Cierre: **53 peticiones HTTP**, nueve grupos de comprobaciones: JWT/roles, cambio de contraseña y revocación, recuperación con correo SMTP realmente recibido y enlace de uso único, usuarios CRUD/bloqueo/activación, último administrador protegido, roles/permisos efectivos, generación/adaptación real de dietas y persistencia de comidas, borrado en cascada y bitácora.
- Las 53 rutas registradas tienen responsable único en las nueve guías. Ese conteo de endpoints es distinto del conteo de peticiones ejecutadas en las pruebas.

- Regresión de IA de rutinas: **6 peticiones HTTP**; generación y adaptación reales con Cohere, ejercicios persistidos, mismo id y cambio al día solicitado.
- Total de los tres recorridos: **94 peticiones HTTP**.

## Correcciones encontradas

La IA devolvió capitalización y acentos en enums y omitió campos en algunas respuestas. Se acotó el formato, se normalizan etiquetas admitidas y se envía un objeto JSON Schema para las dietas. Los rangos y las reglas de negocio continúan validándose en el backend, no se confía solo en el proveedor. Un timeout o respuesta inválida no se anuncia como propuesta guardada. Se verificó la configuración command-r-08-2024; es configurable en .env. El timeout es de 90 segundos y no hay reintentos automáticos.

## Revisión visual real

Se abrió la aplicación en el navegador integrado. Se inició sesión administrativa, buscó una cuenta y guardó su edición desde el panel; se probó Objetivos sin medidas y mostró el rechazo esperado. En Dietas se guardó una comida desde el formulario: 50 g de un alimento de 400 kcal/100 g produjo 200 kcal, 5 g de proteína, 30 g de carbohidratos y 4 g de grasa. Se comprobó que la lista presenta alimentos/cantidades y el nuevo formulario IA. Las capturas locales públicas solo contienen datos ficticios y están en capturas/.

La inspección visual fue en el tamaño real del navegador integrado; no constituye una prueba exhaustiva de todos los dispositivos ni de accesibilidad.

## Construcción y documentación

Build React/Vite correcto. npm audit de dependencias de ejecución de backend y frontend: cero vulnerabilidades conocidas al revisar. Vite conserva un aviso de bundle principal superior a 500 kB; no bloquea compilación ni fue ocultado. Nueve guías, nueve diagramas, 54 puntos de práctica individual y 254 enlaces locales verificados. Los scripts de prueba quedan locales e ignorados; el repositorio incluye el informe, no una suite adicional contra el pedido previo de retirar tests.

## Límites de lo comprobado

Mailpit demuestra SMTP y recepción local; no demuestra entrega a Gmail/Outlook. Esa entrega requiere un remitente real. Cohere puede limitar o fallar fuera de esta prueba. No se probaron producción, concurrencia masiva ni recuperación ante pérdida del volumen. Se mantienen explícitas las exclusiones del alcance y no se certifica que un alumno ya domina el código por haber recibido su guía. Las comprobaciones no garantizan ausencia absoluta de errores.

## Regresión de protección de login · 2/11/2026

Se reincorporó el bloqueo temporal por cuenta, persistido en MySQL. Las pruebas específicas cubren umbral, clave correcta durante bloqueo, vencimiento, ventana inactiva, reinicio del contador tras éxito, correo normalizado, cuentas independientes, intentos simultáneos, recuperación/cambio de contraseña y coexistencia con bloqueo administrativo. Los resultados de esta ampliación se guardan en .local/proteccion-login. No se reinterpretan como una nueva ejecución de todas las pruebas históricas del informe.

Resultado de la ampliación: **36 peticiones HTTP y 12 comprobaciones correctas por versión (72 peticiones entre ambas)**. Se verificó además en los servidores reiniciados y en la interfaz: el quinto fallo del 90 % mostró el aviso de 15 minutos y en el 100 % una contraseña correcta fue rechazada durante el bloqueo. Las capturas propias están en capturas/bloqueo-login.png. La actualización de columnas se ejecutó dos veces sin borrar usuarios.
