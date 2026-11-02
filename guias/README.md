# Las nueve guías · entrega final

Continúan los módulos del 75 % y se distribuye el cierre por recorridos/endpoints. Paulo tiene asignado explícitamente el frontend de Objetivos. Las responsabilidades no se presentan como declaraciones de autoría de código ya existente.

| Integrante | Módulo principal del cierre | Paquete de revisión y defensa |
| --- | --- | --- |
| [Gianluca Pizarro](01-gianluca-pizarro.md) | Cuentas, login y recuperación | 1 de 9 |
| [Tomás Menossi](02-tomas-menossi.md) | Inteligencia artificial y generación de planes | 1 de 9 |
| [Iván Lerner](03-ivan-lerner.md) | Entrenamientos, creación de dietas y altas administrativas | 1 de 9 |
| [Paulo López Stanley](04-paulo-lopez.md) | Objetivos y su frontend completo | 1 de 9 |
| [Gade Silva y Lápiz](05-gade-silva-y-lapiz.md) | Medidas, consumos y habilitación de cuentas | 1 de 9 |
| [Valentín Sued (Sueco)](06-valentin-schueld.md) | Rutinas manuales y gestión de dietas | 1 de 9 |
| [Mateo Romani](07-mateo-romani.md) | Progreso, macros y registro de actividad | 1 de 9 |
| [Joaquín Casanou](08-joaquin-casanou.md) | Catálogo y adaptación de planes con IA | 1 de 9 |
| [Simón Castellani](09-simon-castellani.md) | Perfil, contraseñas y definición de roles | 1 de 9 |

Cada paquete abarca interfaz, endpoint, datos, validaciones, un caso correcto, uno inválido y uno de autorización/cancelación. Se reparte un bloque completo a cada persona; no se asigna a nadie 0 ni se entrega a una sola persona la mitad de la aplicación. No se puede concluir esfuerzo o autoría por contar endpoints o líneas. Si el ensayo muestra una diferencia de carga, se comparte la revisión dentro del módulo, sin inventar commits ni inflar código.

La fracción organizativa de cada paquete es **1/9 (11,111… %)**; las nueve suman exactamente 100 %. Es una cuota acordada de responsabilidad, no una medición de cuánto programó realmente cada alumno.

## Responsables por endpoint

| Método y ruta | Responsable |
| --- | --- |
| `DELETE /api/admin/roles/:id` | [Valentín Sued (Sueco)](06-valentin-schueld.md) |
| `DELETE /api/admin/usuarios/:id` | [Simón Castellani](09-simon-castellani.md) |
| `DELETE /api/consumos/:id` | [Gianluca Pizarro](01-gianluca-pizarro.md) |
| `DELETE /api/cuenta` | [Simón Castellani](09-simon-castellani.md) |
| `DELETE /api/dietas/:id` | [Valentín Sued (Sueco)](06-valentin-schueld.md) |
| `DELETE /api/objetivos/:id` | [Paulo López Stanley](04-paulo-lopez.md) |
| `DELETE /api/rutinas/:id` | [Valentín Sued (Sueco)](06-valentin-schueld.md) |
| `GET /api/admin/bitacora` | [Mateo Romani](07-mateo-romani.md) |
| `GET /api/admin/roles` | [Joaquín Casanou](08-joaquin-casanou.md) |
| `GET /api/admin/usuarios` | [Iván Lerner](03-ivan-lerner.md) |
| `GET /api/consumos` | [Mateo Romani](07-mateo-romani.md) |
| `GET /api/cuenta` | [Simón Castellani](09-simon-castellani.md) |
| `GET /api/dietas` | [Valentín Sued (Sueco)](06-valentin-schueld.md) |
| `GET /api/ejercicios` | [Joaquín Casanou](08-joaquin-casanou.md) |
| `GET /api/entrenamientos` | [Iván Lerner](03-ivan-lerner.md) |
| `GET /api/ia/conversaciones` | [Tomás Menossi](02-tomas-menossi.md) |
| `GET /api/ia/conversaciones/:id` | [Tomás Menossi](02-tomas-menossi.md) |
| `GET /api/ia/estado` | [Tomás Menossi](02-tomas-menossi.md) |
| `GET /api/mediciones` | [Gade Silva y Lápiz](05-gade-silva-y-lapiz.md) |
| `GET /api/objetivos` | [Paulo López Stanley](04-paulo-lopez.md) |
| `GET /api/progreso` | [Mateo Romani](07-mateo-romani.md) |
| `GET /api/rutinas` | [Joaquín Casanou](08-joaquin-casanou.md) |
| `GET /api/salud` | [Gianluca Pizarro](01-gianluca-pizarro.md) |
| `PATCH /api/admin/usuarios/:id/estado` | [Gade Silva y Lápiz](05-gade-silva-y-lapiz.md) |
| `POST /api/admin/roles` | [Simón Castellani](09-simon-castellani.md) |
| `POST /api/admin/usuarios` | [Iván Lerner](03-ivan-lerner.md) |
| `POST /api/consumos` | [Gade Silva y Lápiz](05-gade-silva-y-lapiz.md) |
| `POST /api/dietas` | [Iván Lerner](03-ivan-lerner.md) |
| `POST /api/entrenamientos` | [Iván Lerner](03-ivan-lerner.md) |
| `POST /api/ia/consulta` | [Tomás Menossi](02-tomas-menossi.md) |
| `POST /api/ia/dietas` | [Tomás Menossi](02-tomas-menossi.md) |
| `POST /api/ia/dietas/:id/adaptar` | [Joaquín Casanou](08-joaquin-casanou.md) |
| `POST /api/ia/rutinas` | [Tomás Menossi](02-tomas-menossi.md) |
| `POST /api/ia/rutinas/:id/adaptar` | [Joaquín Casanou](08-joaquin-casanou.md) |
| `POST /api/login` | [Gianluca Pizarro](01-gianluca-pizarro.md) |
| `POST /api/logout` | [Gianluca Pizarro](01-gianluca-pizarro.md) |
| `POST /api/mediciones` | [Gade Silva y Lápiz](05-gade-silva-y-lapiz.md) |
| `POST /api/mediciones/initial` | [Gade Silva y Lápiz](05-gade-silva-y-lapiz.md) |
| `POST /api/objetivos` | [Paulo López Stanley](04-paulo-lopez.md) |
| `POST /api/objetivos/:id/completar` | [Paulo López Stanley](04-paulo-lopez.md) |
| `POST /api/recuperar-password` | [Gianluca Pizarro](01-gianluca-pizarro.md) |
| `POST /api/registro` | [Gianluca Pizarro](01-gianluca-pizarro.md) |
| `POST /api/restablecer-password` | [Gianluca Pizarro](01-gianluca-pizarro.md) |
| `POST /api/rutinas` | [Valentín Sued (Sueco)](06-valentin-schueld.md) |
| `PUT /api/admin/roles/:id` | [Simón Castellani](09-simon-castellani.md) |
| `PUT /api/admin/usuarios/:id` | [Paulo López Stanley](04-paulo-lopez.md) |
| `PUT /api/admin/usuarios/:id/roles` | [Gade Silva y Lápiz](05-gade-silva-y-lapiz.md) |
| `PUT /api/consumos/:id` | [Simón Castellani](09-simon-castellani.md) |
| `PUT /api/cuenta` | [Simón Castellani](09-simon-castellani.md) |
| `PUT /api/cuenta/password` | [Simón Castellani](09-simon-castellani.md) |
| `PUT /api/dietas/:id` | [Paulo López Stanley](04-paulo-lopez.md) |
| `PUT /api/entrenamientos/:id` | [Iván Lerner](03-ivan-lerner.md) |
| `PUT /api/rutinas/:id` | [Valentín Sued (Sueco)](06-valentin-schueld.md) |

Total: 53 endpoints. Cada uno tiene un responsable principal. Los helpers compartidos se explican en las guías de quienes los utilizan. [Conceptos comunes](../docs/BASE-COMUN.md) · [Manual](../docs/MANUAL-USUARIO.md) · [Requisitos](../docs/REQUISITOS-ENTREGA.md).

### Ampliación de login · 2/11/2026

Gianluca Pizarro conserva registro/login/recuperación y suma la protección por intentos: cinco contraseñas incorrectas bloquean nuevos accesos por 15 minutos. Su mismo MD contiene el diagrama actualizado, los campos persistidos, migración, preguntas y práctica. No se agrega un endpoint ni cambia el alcance funcional reservado entre el 90 % y el 100 %.
