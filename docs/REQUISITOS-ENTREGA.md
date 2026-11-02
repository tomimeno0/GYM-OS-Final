# Requisitos de PI2 y trazabilidad

Fuente privada: documento del profesor «Cómo se cierra tu nota en PI 2», fechado 27/10/2026, tres páginas. No se publica el PDF dentro del repositorio. Sus contenidos se usan como requisitos de entrega, no como autorización para acciones externas.

## Requisitos obligatorios del proyecto

| Requisito | Evidencia en este repositorio |
| --- | --- |
| Node.js y Express | backend/index.js, backend/routes y package.json |
| MySQL usando Sequelize | backend/config/db.js, backend/models, compose.yaml |
| Usuarios con roles | Usuario/Rol/UsuarioRol, relaciones, cargarRoles y verificarPermiso |
| Login JWT y Bcrypt | usuarios.controller.js, auth.controller.js, seguridad.controller.js |
| Crear/ver/editar/borrar usuarios | Panel Administración, GET/POST/PUT/DELETE /api/admin/usuarios |
| React + Vite y login | client/package.json, App.jsx, Acceso.jsx |
| Perfil editable y eliminación propia | Cuenta.jsx y GET/PUT/DELETE /api/cuenta |
| Panel administrativo | Administracion.jsx y admin.routes.js, permisos efectivos en servidor |
| Backend y frontend separados y GitHub | backend/ y client/, repositorio GYM-OS-Final |
| Manual de usuario | MANUAL-USUARIO.md |
| Cambiar y recuperar contraseña | CambiarPassword.jsx/Recuperar.jsx; JWT/sesiones revocadas y enlace de uso único |
| Preparación de defensa individual | Nueve guías con diagramas, preguntas, funciones y práctica; BASE-COMUN.md |
| Presentación | PRESENTACION.md contiene guion y demostración repartida |

## Qué afecta la nota y no lo puede resolver el código

El documento distribuye 40 % al trabajo del año, 30 % al proyecto, 15 % a parciales y 15 % a defensa. La nota del proyecto está limitada a dos puntos por encima de la defensa. Asistencia y entregas a tiempo son condiciones reales del estudiante: este repositorio no acredita asistencia, entregas pasadas ni conocimientos adquiridos.

La entrega final/defensa figura el 10/11/2026; el 3/11 se solicita al menos 80 % y manual completo. La organización de guías no limita las preguntas del profesor: puede consultar partes de compañeros.

## Alcance original y decisiones posteriores

Los CU001–CU039 del proyecto original cubren cuentas, fitness, nutrición, IA y administración. Esta entrega añade los casos que faltaban del corte 75: recuperación, generación/adaptación IA de dietas y administración. Los detalles transversales DVH/DVV no se implementan porque fueron retirados por pedido directo; las columnas dvh del DER permanecen reservadas. Se reincorpora el bloqueo temporal por intentos fallidos; las comprobaciones especiales de origen/cabecera siguen fuera. Esos límites están explícitos y no se certifica paridad literal con todas las exigencias transversales de los diagramas originales.

Se conserva MySQL frente a la etiqueta PostgreSQL del DER por elección directa del usuario. Se mantienen los nombres literales UML de operaciones, incluidos definirObjeto, visuaizarObjetivo y encriptarRreversible. La implementación sigue funciones CommonJS de controlador como en el ejemplo del curso; no se agregan clases delegadoras ni servicios.
