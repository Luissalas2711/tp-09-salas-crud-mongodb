## 1. Punto de partida y nombre de la copia.

Nombre de la entrega: tp-09-salas-crud-mongodb
Origen: copia funcional del TP 08 individual. se conserva la lectura y creación existentes y se completa el CRUD de la API: PUT reemplaza la reserva, PATCH aplica cambios parciales y DELETE elimina físicamente el documento. El sitio HTML y la API siguen usando la misma base y servicio.

## 2. Versiones utilizadas y confirmación del uso de Atlas Free (M0)

Node.js: v24.19.0
Mongoose: v9.11.2 (gestion de esquemas y conexion)
Express: v5.2.1 (servidor web y rutas)
Entorno de base de datos: MongoDB Atlas Free (M0), `reservas_salas_u9`
Coleccion: `reservas`

## 3. Pasos desde una descarga nueva: instalar dependencias, preparar el clúster gratuito, usuario e IP permitida, copiar la plantilla de entorno y ejecutar.

1. Instalar dependencias: Ejecutar `npm install` en la raiz del proyecto para instalar los modulos necesarios
2. Preparar cluster gratuito en MongoDB Atlas:
    * Crear un cluster gratuito en Atlas Free
    * Configurar un usuario de base de datos con permisos de lectura y escritura
    * Agregar la ip permitida correspondiente en el panel de red
3. Configurar el entorno:
    * Tomar como referencia el archivo `.env.example` y crear una copia nombrada ".env" en la raiz del proyecto
    * Reemplazar los marcadores de la variable `MONGODB_URI` con la URI provista por Atlas, especificando la base de datos
4. Ejecución de scripts y servidor:
    * Comprobar conexión: `node --env-file .env scripts/comprobar-conexion.js`
    * Crear una reserva: `node --env-file .env scripts/crear-reserva.js` Cada ejecución agrega una reserva a la base.
    * Listar reservas: `node --env-file .env scripts/listar-reservas.js`
    * Iniciar el servidor web con persistencia en MongoDB: `npm start`

## 4. Diagnóstico DNS y resolutores usados, si hubo ajustes; comandos exactos de conexión, creación, listado, calidad y arranque web.

Diagnóstico DNS y resolutores usados: Para evitar bloqueos o fallos en la resolución de registros de MongoDB Atlas desde Node.js, se configuraron explícitamente los servidores DNS públicos autorizados (`8.8.8.8` y `1.1.1.1`) utilizando `dns.setServers(["8.8.8.8", "1.1.1.1"])` dentro de `src/config/base-datos.js` previo a la conexión

Comandos exactos de ejucucion:
Comprobar conexión: `node --env-file .env scripts/comprobar-conexion.js`
Crear reserva: `node --env-file .env scripts/crear-reserva.js`
Listar reservas: `node --env-file .env scripts/listar-reservas.js`
Control de calidad (Lint y Formato): `npm run check`
Arranque del sitio web: `npm start`

## 5. Estructura, capas y modelo

- `src/index.js`: carga la configuración, conecta con MongoDB antes de iniciar el servidor y gestiona el cierre ordenado.
- `src/app.js`: configura Express, middlewares y routers.
- `src/config/`: configuración del entorno y conexión con MongoDB.
- `src/modelos/reserva.js`: esquema de Mongoose asociado a la colección `reservas`.
- `src/servicios/reservas.js`: operaciones de listar, buscar por ID, contar, crear, actualizar y eliminar reservas en MongoDB.
- `src/controladores/reservas.js`: coordina las operaciones y prepara las respuestas HTML o JSON.
- `src/rutas/reserva.js`: rutas del sitio HTML.
- `src/rutas/api-reservas.js`: rutas de la API JSON.
- `src/middleware/`: middlewares de validación y solicitudes.

El sitio HTML y la API usan el mismo servicio y consultan la misma colección `reservas`. No se cargan reservas automáticamente al iniciar.

El modelo define `estudiante`, `email`, `sala`, `fecha`, `turno`, `personas` y `estado`. El campo `estado` permite `pendiente` o `confirmada` y su valor predeterminado es `pendiente`. MongoDB genera el identificador `_id`.

## 6. Validaciones y límites

El POST valida los seis campos originales: estudiante, email, sala, fecha, turno y personas. No permite que el cliente asigne `estado` ni `_id`; las reservas nuevas comienzan como `pendiente`.

PUT exige los siete campos editables para reemplazar la reserva completa. PATCH acepta uno o más campos permitidos y conserva los que se omiten. Ambos rechazan campos desconocidos, `_id`, operadores y cuerpos ausentes o inválidos.

Las validaciones de PUT/PATCH comprueban estudiante y fecha como texto no vacío, email con `@`, salas y turnos permitidos, personas como entero entre 1 y 6 y estado igual a `pendiente` o `confirmada`. Personas puede llegar como número o como texto numérico no vacío; se guarda como número.

Los IDs mal formados responden 400; los IDs válidos sin reserva responden 404. El JSON mal formado en la API responde 400 JSON. Los errores inesperados responden 500 JSON sin exponer detalles internos.

No se valida que la fecha exista en el calendario o sea futura. Tampoco se controlan disponibilidad, solapamientos, cupos compartidos ni reservas duplicadas.

## 7. Pruebas realizadas y persistencia

| Caso | Resultado observado |
|---|---|
| POST válido | `201`; creó la reserva con estado `pendiente` y devolvió su ID |
| GET por ID | `200`; devolvió la reserva |
| PUT completo | `200`; actualizó los siete campos y conservó el ID |
| PATCH parcial | `200`; convirtió `"4"` a número y conservó los campos omitidos |
| PUT incompleto | `400`; la reserva quedó sin cambios |
| PATCH con `_id` | `400`; rechazó el campo y la reserva quedó sin cambios |
| Estado inválido | `400`; la reserva conservó su estado anterior |
| Personas `0`, `7`, `2.5`, `"abc"`, `true`, `[]` y `{}` | Rechazados; la reserva conservó `personas: 2` |
| PATCH sin body | `400` JSON; indicó que se requiere un objeto con datos |
| ID mal formado (`1`) | `400` JSON |
| GET con ID válido inexistente | `404` JSON |
| PUT con ID válido inexistente | `404`; no creó una reserva |
| DELETE de una reserva existente | `204` sin cuerpo |
| GET después de DELETE | `404`; la reserva fue eliminada físicamente |
| Listado después de eliminar la primera reserva de prueba | `200` con un arreglo vacío |
| Actualización y reinicio del servidor | El GET posterior devolvió `200` y mantuvo el estado `confirmada` |
| Eliminación y reinicio del servidor | El GET posterior devolvió `404` |

## 8. Cambios respecto del TP 08

Se completo el CRUD de reservas en la API: PUT reemplaza una reserva, PATCH actualiza parcialmente sus campos y DELETE elimina fisicamente el documento. Se agrego el campo `estado`, con `pendiente` como valor  predeterminado. El sitio HTML conserva su funcionamiento y la API y el sitio siguen usando el mismo servicio y la misma coleccion de MongoDB. Se mantienen la conexion a la base antes del arranque y el cierre ordenado del servidor y de la conexion

## 9. Confirmación de que no se publican .env, credenciales ni datos personales

El archivo .env, que contiene la URI privada de conexion, esta excluida de GIT mediante .gitignore. se versiona unicamente .env.example, con valores de ejemplo y sin credenciales, las reservas de prueba usan datos ficticios, no se incluyen datos personales reales

## 10. Endpoints y pruebas de la API

Base: `http://localhost:3000`

| Método | Ruta | Resultado esperado |
|---|---|---|
| GET | `/api/reservas` | `200`, listado JSON |
| GET | `/api/reservas/:id` | `200`; `400` si el ID es inválido; `404` si no existe |
| POST | `/api/reservas` | `201`, reserva creada con estado `pendiente` y cabecera `Location` |
| PUT | `/api/reservas/:id` | `200`, reemplaza los siete campos editables y conserva el ID |
| PATCH | `/api/reservas/:id` | `200`, actualiza solo los campos enviados |
| DELETE | `/api/reservas/:id` | `204` sin cuerpo; `404` si no existe |

Para POST, PUT y PATCH, elegir **Body → raw → JSON**. Para GET y DELETE, dejar **Body → none**.

Ejemplo de POST:

```json
{
  "estudiante": "Prueba",
  "email": "prueba@example.com",
  "sala": "Sala Norte",
  "fecha": "2026-10-22",
  "turno": "Tarde",
  "personas": 2
}