# 🐾 API PETS - Backend & DevOps

![Node.js](https://img.shields.io/badge/Node.js-24.x-green) ![Docker](https://img.shields.io/badge/Docker-Ready-blue) ![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-success) ![Swagger](https://img.shields.io/badge/Swagger-Documented-85EA2D)

API PETS es un sistema backend RESTful diseñado para gestionar la adopción de mascotas. Este proyecto integra buenas prácticas de desarrollo, manejo de errores personalizado, documentación interactiva y un flujo completo de despliegue contenerizado mediante Docker.

## ✨ Características Principales

* **Gestión de Usuarios y Mascotas:** Endpoints completos (CRUD) para la administración de entidades.
* **Sistema de Adopciones:** Lógica transaccional para vincular mascotas con usuarios, validando disponibilidad.
* **Autenticación Segura:** Sistema de login basado en JWT (JSON Web Tokens) almacenados en Cookies (HTTP-Only).
* **Manejo de Errores (CustomError):** Diccionario centralizado de errores para respuestas HTTP consistentes (Routing, Database, Validation).
* **Documentación Interactiva:** Integración con Swagger/OpenAPI para explorar y probar la API desde `/api/docs`.
* **Testing Automatizado:** Pruebas de integración exhaustivas utilizando Mocha, Chai y Supertest.
* **DevOps & Seguridad:** Aplicación 100% dockerizada, optimizada en Alpine Linux y auditada con Docker Scout (0 vulnerabilidades críticas).

---

## 🔗 Enlaces Importantes

* **Repositorio de GitHub:** [🔗 https://github.com/Lucia-rg/API_PETS.git](https://github.com/Lucia-rg/API_PETS.git)
* **Imagen en DockerHub:** [🔗 https://hub.docker.com/r/luciarodg/api-pets](https://hub.docker.com/r/luciarodg/api-pets)

---

## 🛠️ Configuración e instalación local

Sigue estos pasos para preparar tu entorno de desarrollo y levantar el proyecto:

**1. Clonar el repositorio e instalar las dependencias:**
```bash
git clone https://github.com/Lucia-rg/API_PETS.git
cd API_PETS
npm install
```
**2. Configurar las variables de entorno:**
Copia `.env.example` a un archivo `.env` y reemplaza los valores con tus credenciales reales:

```env
# Configuración de Base de Datos MongoDB
MONGODB_URI=mongodb+srv://<db_username>:<db_password>@cluster.mongodb.net/?retryWrites=true&w=majority&appName=ClusterName
MONGODB_URI_TEST=mongodb+srv://<db_username>:<db_password>@cluster.mongodb.net/?retryWrites=true&w=majority&appName=ClusterNameTest
DB_NAME=nombre_base_de_datos

# Configuración del Servidor
PORT=8080
NODE_ENV=desarrollo
BASE_URL=http://localhost:8080

# Configuración JWT
JWT_SECRET=tu_clave_secreta_jwt
JWT_EXPIRES_IN=24h
```
**Nota sobre la base de datos:** Observa que hay dos URI de conexión. `MONGODB_URI` es para el entorno de desarrollo/producción, mientras que `MONGODB_URI_TEST` se utiliza automáticamente al ejecutar los tests automatizados para proteger y no ensuciar tus datos reales.

**3: Ejecutar el proyecto:**
    ```bash
    npm run dev
    ```

## 🚀 Guía de Despliegue (Docker)

La forma más rápida de ejecutar este proyecto es utilizando la imagen pública de DockerHub.

### Requisitos Previos
* Docker y Docker Desktop instalados.
* Un archivo `.env` local con tus variables de entorno configuradas.

### Pasos para ejecutar:

1. **Descargar la imagen desde DockerHub:**
   ```bash
   docker pull luciarodg/api-pets:1.0.3
   ```

2. **Levantar el contenedor:**
   Asegúrate de estar en el directorio donde se encuentra tu archivo `.env`.
   ```bash
   docker run -d -p 8080:8080 --name adoptme-api --env-file .env luciarodg/api-pets:1.0.3

3. **Verificar el funcionamiento:**
    Abre tu navegador y visita: `http://localhost:8080/api/docs` para ver la interfaz de Swagger.

## Pruebas de Integración (Testing)
El proyecto cuenta con una suite robusta de **34 pruebas de integración** desarrolladas con Mocha, Chai y Supertest. Las pruebas validan el comportamiento completo de la API, incluyendo flujos de éxito, validaciones de formato, seguridad de sesión y el correcto disparo del diccionario de errores personalizados (CustomErrors).

### 📊 Resumen de Cobertura
* **Adoptions (`/api/adoptions`):** 10 pruebas (Creación, consultas, cruce de validaciones entre usuario y mascota).
* **Pets (`/api/pets`):** 6 pruebas (CRUD completo, subida de imágenes, validación de campos obligatorios).
* **Sessions (`/api/sessions`):** 12 pruebas (Registro, encriptación, validación de JWT, manejo de cookies y seguridad de rutas).
* **Users (`/api/users`):** 6 pruebas (CRUD, validación de ObjectId, manejo de errores 404).

### Pasos para correr los test:

Asegúrate de haber completado la configuración local e instalado las dependencias. Luego, simplemente ejecuta:
```bash
    npm test
```

### Evidencia de pruebas:

<details>
<summary><strong>✅ Ver log detallado de la ejecución (click para expandir)</strong></summary>

```text
> api-pets@1.0.0 test
> cross-env NODE_ENV=test mocha test --recursive --exit --timeout 10000

info: Conexión a la base de datos exitosa
info: Conectado a la base de datos de pruebas

  Testing del Router de Adoptions (/api/adoptions)
    ✔ 1. GET /api/adoptions - Debe retornar todas las adopciones registradas (192ms)
    ✔ 2. GET /api/adoptions/:aid - Debe retornar una adopción específica por su ID (154ms)
error: Error name: Adoption not found - Cause: The adoption with ID 64b1f2e3c9e8a1b2c3d4e5f6 does not exist in the database
    ✔ 3. GET /api/adoptions/:aid - Debe retornar error 404 si la adopción no existe (155ms)
error: Error name: User not found - Cause: The user with ID 64b1f2e3c9e8a1b2c3d4e5f6 does not exist in the database
    ✔ 4. POST /api/adoptions/:uid/:pid - Debe retornar error 404 si el usuario no existe (155ms)
error: Error name: Pet not found - Cause: The pet with ID 64b1f2e3c9e8a1b2c3d4e5f6 does not exist in the database
    ✔ 5. POST /api/adoptions/:uid/:pid - Debe retornar error 404 si la mascota no existe (298ms)
    ✔ 6. POST /api/adoptions/:uid/:pid - Debe retornar error 400 si la mascota ya está adoptada (299ms)
    ✔ 7. POST /api/adoptions/:uid/:pid - Debe procesar la adopción exitosamente con datos correctos (1068ms)
    ✔ 8. GET /api/adoptions/:aid - Debe devolver error si el formato del ID de adopción es inválido (CastError)
error: Error name: CastError - Cause: undefined
    ✔ 9. POST /api/adoptions/:uid/:pid - Debe devolver error si el formato del ID de usuario es inválido
error: Error name: CastError - Cause: undefined
    ✔ 10. POST /api/adoptions/:uid/:pid - Debe devolver error si el formato del ID de la mascota es inválido (152ms)

  Testing del router de Pets (/api/pets)
    ✔ 1. GET /api/pets - Debe retornar un arreglo de mascotas y status 200 (150ms)
    ✔ 2. POST /api/pets - Debe crear una mascota correctamente con datos válidos (171ms)
error: Error name: Pet creation error - Cause: The data to create the pet is invalid.
    Required properties:
    * name: needs to be a String, received Mascota Incompleta
    * specie: needs to be a String, received undefined
    * birthDate: needs to be a String, received undefined
    ✔ 3. POST /api/pets - Debe devolver error si faltan datos obligatorios (Validación)
    ✔ 4. PUT /api/pets/:pid - Debe actualizar una mascota existente (304ms)
    ✔ 5. DELETE /api/pets/:pid - Debe eliminar una mascota por ID (310ms)
    ✔ 6. POST /api/pets/withimage - Debe crear una mascota cargando una imagen (182ms)

  Testing del Router de Sessions (/api/sessions)
    ✔ 1. POST /api/sessions/register - Debe registrar un usuario exitosamente, hashear la contraseña y tener el rol "user" por defecto (548ms)
    ✔ 2. POST /api/sessions/register - Debe impedir crear dos usuarios con el mismo email (duplicado) (153ms)
error: Error name: User creation error - Cause: One or more properties are incomplete or invalid.
        List of required properties:
        * first_name: needs to be a String, received Incompleto
        * email: needs to be a String, received incompleto@correo.com
    ✔ 3. POST /api/sessions/register - Debe devolver error si faltan campos obligatorios
    ✔ 4. POST /api/sessions/login - Debe iniciar sesión y devolver una cookie (coderCookie) (266ms)
error: Error name: Auth error - Cause: Incorrect password
    ✔ 5. POST /api/sessions/login - Debe devolver error con credenciales inválidas (262ms)
error: Error name: Login error - Cause: Missing required fields: email, password
    ✔ 6. POST /api/sessions/login - Debe devolver error si el body está incompleto (falta password) 
error: Error name: Login error - Cause: Missing required fields: email, password
    ✔ 7. POST /api/sessions/login - Debe devolver error si el body está incompleto (falta email) 
    ✔ 8. GET /api/sessions/current - Debe leer la cookie y devolver al usuario logueado
    ✔ 9. GET /api/sessions/current - Debe fallar si no se envía la cookie de sesión
    ✔ 10. GET /api/sessions/logout - Debe limpiar la cookie y cerrar sesión
    ✔ 11. GET /api/sessions/current - Debe rechazar la petición si el token fue alterado (firma inválida)
    ✔ 12. GET /api/sessions/current - Debe devolver 401 al consultar current después de un logout

  Testing del Router de Users (/api/users)
    ✔ 1. GET /api/users - Debe retornar un arreglo de usuarios y status 200 (153ms)
    ✔ 2. GET /api/users/:uid - Debe retornar un usuario específico por su ID (152ms)
    ✔ 3. PUT /api/users/:uid - Debe actualizar los datos de un usuario (460ms)
    ✔ 4. DELETE /api/users/:uid - Debe eliminar un usuario del sistema (458ms)
    ✔ 5. GET /api/users/:uid - Debe devolver error si el formato del ID es inválido (CastError)
error: Error name: User not found - Cause: The user with ID 64b1f2e3c9e8a1b2c3d4e5f6 does not exist in the database
    ✔ 6. GET /api/users/:uid - Debe devolver error 404 si el ID tiene formato válido pero no existe en la BD (152ms)

info: Conexión de pruebas cerrada

  34 passing (11s)
```

</details>

## 🛠️ Tecnologías Utilizadas
* Backend: Node.js, Express.js
* Base de Datos: MongoDB, Mongoose
* Seguridad: bcrypt, jsonwebtoken, cookie-parser
* Testing: Mocha, Chai, Supertest
* Documentación: swagger-jsdoc, swagger-ui-express
* Infraestructura: Docker, Alpine Linux