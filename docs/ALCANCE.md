# Alcance de la entrega final

Se implementan los recorridos funcionales CU001–CU039: cuentas (registro/login/logout/recuperación/perfil/baja), medidas y objetivos, progreso, rutinas manuales y por IA, entrenamientos, dietas manuales y por IA, consumos/macros, chat y administración de usuarios/roles. Hay 53 endpoints. También se incluye cambio de contraseña autenticado, solicitado por la pauta PI2.

La versión se deriva del repositorio 75 %, que queda intacto. El proyecto completo histórico GYM-OS tampoco se modifica. Backend CommonJS en backend/ y React en client/, sin servicios ni validadores genéricos. Las transacciones se conservan para cambios conjuntos y las autorizaciones se comprueban en middleware.

«100 %» expresa alcance funcional de la entrega, no una evaluación de nota ni autoría. No se promete equivalencia literal con los 39 diagramas en sus controles de integridad: por instrucción previa siguen fuera DVH/DVV y comprobaciones especiales de origen/cabecera. Se mantiene Bcrypt, JWT, cookies HttpOnly, filtros de propietario, cifrado AES del teléfono, confirmaciones, validaciones y transacciones. Las columnas dvh están reservadas.

La IA requiere Cohere, un proveedor externo y consentimiento; no puede garantizarse disponibilidad continua del proveedor. Recuperación puede probarse con SMTP y buzón local Mailpit; entrega a correos externos exige configurar un remitente real. El catálogo textual de ejercicios funciona sin medios de terceros con licencia separada.

Nombres: CU018 se trata como edición manual y CU019 como adaptación IA, siguiendo las secuencias particulares frente a su índice contradictorio. La baja de objetivo/rutina/dieta conserva historia; eliminar una cuenta borra sus datos asociados. Un entrenamiento contiene una copia de los ejercicios. Un solo objetivo activo y entrenamiento en curso por cuenta se controlan con campos únicos y validaciones.

[Requisitos y evidencia](REQUISITOS-ENTREGA.md) · [Resultados de pruebas](VERIFICACION.md) · [API y responsables](../guias/README.md).
