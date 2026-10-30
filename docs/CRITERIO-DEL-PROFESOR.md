# Estilo de implementación

Se mantiene el estilo del ejemplo del curso: JavaScript CommonJS, rutas explícitas, funciones req/res, controladores que consultan modelos Sequelize, validaciones con if y recorridos for. React usa estado local, efectos de carga y Axios. map se reserva para construir JSX/listas de presentación. No hay capa de servicios, clases delegadoras, validadores genéricos ni reintentos automáticos.

Se conserva try/catch y transacción explícita en operaciones que deben guardarse juntas. JWT/Bcrypt, roles y recuperación/cambio de contraseña forman parte del documento PI2 más reciente. CORS se explica como concepto de defensa: en esta instalación de un mismo origen no hace falta habilitar lecturas entre sitios. La lógica concreta y los límites están en las guías, no escondidos en una abstracción profesional adicional.
