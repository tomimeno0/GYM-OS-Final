# Guion de presentación y demostración

Duración sugerida: 12–15 minutos grupales; no reemplaza la defensa individual. Abrir previamente la app, el buzón local y el código. Usar datos ficticios y ocultar .env. Cada persona expone su recorrido real y reconoce el apoyo de IA según corresponda; no atribuirse partes que no puede explicar.

1. Gianluca: problema que resuelve GYM-OS; estructura backend/client; registro/login y recuperación mediante mensaje SMTP local. Mostrar una validación.
2. Gade: cargar medidas y un consumo; demostrar que las cantidades calculan nutrientes. Explicar filtros por usuario.
3. Paulo López Stanley: mostrar **el frontend de Objetivos**, su estado/formulario, crear una meta y cancelar una baja. Seguir una llamada Axios hasta el controlador. Señalar continuidad con sus dietas.
4. Valentín: crear/editar rutina y detallar una dieta con alimentos. Explicar cabecera/detalle y qué se conserva al dar de baja.
5. Iván: iniciar y completar entrenamiento; mostrar historial y copia de ejercicios. Alta de usuario desde Administración sin reemplazar la sesión del admin.
6. Mateo: gráfico de progreso y resumen diario de macros; calcular un ejemplo a mano y contrastarlo con pantalla. Mostrar bitácora con el rol autorizado.
7. Tomás: chat, consentimiento y llamada a Cohere; generar propuesta de rutina/dieta y explicar por qué se valida la respuesta externa antes de guardarla.
8. Joaquín: catálogo y adaptación de un plan existente; verificar que conserva id, modifica detalles y rechaza recursos ajenos.
9. Simón: perfil, cambio de contraseña y roles/permisos. Explicar revocación de sesiones y demostrar un 403 con un cliente sin permisos.

Cierre: volver a los requisitos PI2 y mostrar manual, guías y GitHub. Separar implementación comprobada de decisiones excluidas (DVH/DVV, endurecimiento fuera de alcance) y de disponibilidad de Cohere/correo externo. No prometer nota máxima.

Antes de exponer: cada uno completa los mismos seis puntos de práctica de su guía y recorre BASE-COMUN.md. Si no puede explicar una función, primero la revisa con el compañero responsable y prueba una modificación pequeña.
