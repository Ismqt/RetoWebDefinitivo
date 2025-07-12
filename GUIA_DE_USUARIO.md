# Guía de Usuario: Sistema de Gestión de Vacunación

## 1. Introducción

Bienvenido al Sistema de Gestión de Vacunación. Esta aplicación integral está diseñada para facilitar la administración de campañas de vacunación, permitiendo la gestión eficiente de citas, inventario de vacunas, centros de vacunación, pacientes y personal médico. Cuenta con un portal web intuitivo para pacientes y un panel de administración completo para el personal autorizado.

Este documento proporciona una visión general del sistema, su arquitectura, funcionalidades y cómo utilizar sus diferentes módulos.

## 2. Arquitectura del Sistema

El sistema se basa en una arquitectura moderna de tres capas:

*   **Frontend (Interfaz de Usuario):** Desarrollado con **Next.js** (un framework de **React**) y **TypeScript**. La interfaz es responsiva y moderna, utilizando **Tailwind CSS** para el diseño y la librería de componentes **Shadcn/UI** para una experiencia de usuario consistente y atractiva. Existen varias aplicaciones frontend:
    *   `frontend/`: La aplicación principal para usuarios (pacientes) y personal administrativo/médico.
    *   `frontend/`: La aplicación principal que probablemente sirve tanto a pacientes como al personal administrativo/médico para sus respectivos paneles y funcionalidades.
    *   `Homepage/`: Una aplicación Next.js separada, probablemente destinada a ser la página de inicio pública o el portal informativo del sistema de vacunación. Puede incluir información general, noticias, enlaces para acceder al portal de pacientes, etc.
    *   `Apartado Medico/`: Otra aplicación Next.js separada. Su nombre sugiere que está específicamente diseñada para el personal médico. Podría contener funcionalidades detalladas para la gestión de citas médicas, historiales de pacientes, y otras tareas específicas del rol médico, posiblemente con una interfaz de usuario adaptada a estas necesidades. Es importante determinar si esta es una interfaz principal para médicos o complementaria a las funcionalidades dentro de `frontend/`.
*   **Backend (API):** Una API RESTful robusta construida con **Node.js** y el framework **Express.js**. Se encarga de toda la lógica de negocio, la validación de datos y la comunicación segura con la base de datos.
*   **Base de Datos:** Utiliza **Microsoft SQL Server** para el almacenamiento persistente y seguro de los datos. Gran parte de la lógica de negocio compleja y las consultas se manejan a través de **procedimientos almacenados (Stored Procedures)** para optimizar el rendimiento, la seguridad y la atomicidad de las operaciones.

## 3. Estructura del Repositorio

El código fuente del proyecto está organizado en los siguientes directorios principales:

*   `frontend/`: Contiene el código fuente de la aplicación web principal de Next.js.
    *   `app/`: Define las páginas y rutas de la aplicación.
    *   `components/`: Alberga componentes reutilizables de React (incluyendo componentes de UI de Shadcn).
    *   `lib/`: Contiene funciones de utilidad, configuración y lógica del lado del cliente.
    *   `hooks/`: Contiene hooks personalizados de React, como `use-api.ts` para la comunicación con el backend.
    *   `styles/`: Hojas de estilo globales.
*   `Homepage/`: Contiene otra aplicación Next.js, probablemente para la página de inicio pública o portal informativo. Su estructura es similar a `frontend/`.
*   `Apartado Medico/`: Contiene otra aplicación Next.js, posiblemente enfocada en las funcionalidades específicas del personal médico. Su estructura es similar a `frontend/`.
*   `api/`: Contiene el código fuente del servidor backend (Node.js/Express).
    *   `routes/`: Define los endpoints de la API para cada recurso (ej. `appointments.js`, `users.js`).
    *   `middleware/`: Incluye middlewares para la gestión de peticiones, como `authMiddleware.js` para la autenticación basada en tokens JWT.
    *   `config/`: Contiene archivos de configuración, como `db.js` para la conexión a la base de datos.
*   `database/`: Contiene los scripts SQL para la base de datos.
    *   `schema.sql`: Script para la creación de la estructura de la base de datos (tablas, relaciones, tipos).
    *   `programmability/`: Incluye todos los procedimientos almacenados (`usp_*.sql`) y funciones (`fn_*.sql`) del sistema, que encapsulan la lógica de negocio del lado de la base de datos.
    *   `migrations/`: Scripts para realizar cambios incrementales en el esquema de la base de datos.
*   `README.md`: El archivo principal de información del proyecto.

## 4. Funcionalidades por Módulo/Rol

El sistema ofrece distintas funcionalidades según el rol del usuario.

### 4.1. Portal de Pacientes (Accesible a través de `frontend/` y/o `Homepage/`)

Los pacientes pueden:

*   **Registro e Inicio de Sesión:** Crear una cuenta nueva y acceder al sistema de forma segura.
*   **Gestión de Perfil:** Actualizar su información personal.
*   **Gestión de Menores a Cargo (Dependientes):** Registrar y administrar la información de los niños o dependientes bajo su tutela para la vacunación.
*   **Búsqueda de Centros de Vacunación:** Encontrar centros de vacunación cercanos o disponibles.
*   **Agendar Citas:**
    *   Seleccionar un centro de vacunación.
    *   Ver la disponibilidad de horarios.
    *   Reservar una cita para ellos mismos o sus dependientes.
*   **Consultar y Cancelar Citas:** Ver sus citas programadas y cancelarlas si es necesario.
*   **Consultar Historial de Vacunación:** Acceder al registro de las vacunas recibidas.

### 4.2. Panel de Administración y Gestión (Accesible a través de `frontend/` principalmente en rutas como `/admin`, `/management`)

Este panel está destinado al personal autorizado (Administradores, Personal Médico con ciertos privilegios).

#### 4.2.1. Funciones de Administrador del Sistema

*   **Gestión de Usuarios:**
    *   Crear, editar, y eliminar cuentas de usuario (pacientes, personal médico, otros administradores).
    *   Asignar y gestionar roles y permisos.
*   **Gestión de Centros de Vacunación:**
    *   Crear, registrar y configurar nuevos centros de vacunación.
    *   Actualizar la información de los centros existentes (ubicación, capacidad, estado).
    *   Asignar personal médico a los centros.
*   **Gestión de Catálogo de Vacunas:**
    *   Añadir nuevas vacunas al sistema.
    *   Editar la información de las vacunas existentes (tipo, dosis requeridas, edad de aplicación).
*   **Gestión de Inventario de Vacunas:**
    *   Registrar lotes de vacunas (fabricante, fecha de caducidad, cantidad).
    *   Asignar lotes de vacunas a los diferentes centros de vacunación.
    *   Monitorear los niveles de stock de vacunas por centro.
*   **Dashboard y Reportes:**
    *   Visualizar estadísticas clave sobre la campaña de vacunación (citas completadas, inventario, etc.).
    *   Generar reportes.
*   **Gestión de Disponibilidad Horaria (General):**
    *   Posiblemente configurar horarios base o plantillas para los centros.

#### 4.2.2. Funciones del Personal Médico (Rol Médico o similar)

*   **Gestión de Disponibilidad Horaria Personal:**
    *   El personal médico puede definir y actualizar sus propios horarios de trabajo y disponibilidad en los centros a los que están asignados.
*   **Visualización y Gestión de Citas Asignadas:**
    *   Ver la lista de pacientes con citas programadas para ellos.
    *   Acceder a los detalles de las citas.
*   **Atención de Citas (Módulo Médico - podría estar en `Apartado Medico/` o integrado en `frontend/management/medical`):**
    *   Confirmar la asistencia del paciente.
    *   Registrar la administración de la vacuna.
    *   Seleccionar el lote de vacuna utilizado.
    *   Anotar observaciones relevantes sobre la vacunación.
*   **Actualización del Historial de Vacunación del Paciente:**
    *   El sistema actualiza automáticamente el historial del paciente tras registrar una vacunación.
*   **Consulta de Historial Clínico/Vacunación del Paciente:**
    *   Acceder al historial completo de vacunación y, posiblemente, otra información médica relevante del paciente que está atendiendo.
*   **Registro de Pacientes:**
    *   En algunos casos, el personal médico podría tener permisos para registrar nuevos pacientes o actualizar su información si es necesario durante una cita.

## 5. Guía de Instalación y Puesta en Marcha

Siga estos pasos para configurar y ejecutar el proyecto en un entorno de desarrollo local.

### 5.1. Prerrequisitos

*   **Node.js:** Versión 20.x o superior.
*   **npm:** (Normalmente viene con Node.js) o un gestor de paquetes compatible (como pnpm, si se usa en alguna parte del proyecto).
*   **Microsoft SQL Server:** Una instancia local o en la nube (ej. SQL Server Developer Edition, Express Edition, o Azure SQL Database).
*   **Cliente SQL Server:** Una herramienta para interactuar con SQL Server, como SQL Server Management Studio (SSMS) o Azure Data Studio.

### 5.2. Configuración de la Base de Datos

1.  **Crear la Base de Datos:**
    *   Abra su cliente de SQL Server.
    *   Conéctese a su instancia de SQL Server.
    *   Cree una nueva base de datos (por ejemplo, `SistemaVacunacionDB`).
2.  **Ejecutar Scripts SQL:**
    *   Navegue al directorio `database/` en el proyecto.
    *   Ejecute el script `schema.sql` en la base de datos recién creada. Esto creará todas las tablas, vistas y tipos necesarios.
    *   Ejecute todos los scripts `.sql` que se encuentran en el directorio `database/programmability/`. Estos scripts crean los procedimientos almacenados y funciones esenciales para la lógica de negocio. (El orden puede ser importante si hay dependencias, aunque generalmente los scripts de creación de SPs pueden ejecutarse en cualquier orden si las tablas ya existen).
    *   Revise el directorio `database/migrations/` por si hay scripts adicionales que necesiten ser ejecutados en un orden específico para actualizar el esquema.

### 5.3. Configuración del Backend (API)

1.  **Navegar al Directorio:**
    ```bash
    cd api
    ```
2.  **Crear Archivo de Entorno:**
    *   Copie el archivo `.env.example` a un nuevo archivo llamado `.env`.
    *   Modifique el archivo `.env` con la configuración de su entorno:
        *   `DB_USER`: Su usuario de SQL Server.
        *   `DB_PASSWORD`: Su contraseña de SQL Server.
        *   `DB_SERVER`: La dirección de su servidor SQL Server (ej. `localhost`, `.\SQLEXPRESS`).
        *   `DB_DATABASE`: El nombre de la base de datos que creó (ej. `SistemaVacunacionDB`).
        *   `DB_PORT` (opcional): El puerto de su SQL Server si no es el predeterminado (1433).
        *   `PORT`: El puerto en el que se ejecutará la API (por defecto `3001` o el valor en `.env.example`).
        *   `JWT_SECRET`: Una cadena secreta larga y aleatoria para firmar los tokens de autenticación.
3.  **Instalar Dependencias:**
    ```bash
    npm install
    ```
4.  **Iniciar el Servidor API:**
    ```bash
    npm start
    ```
    *   Por defecto, la API se ejecutará en `http://localhost:PUERTO_API` (donde `PUERTO_API` es el valor de `PORT` en su `.env`, ej. 3001).

### 5.4. Configuración de los Frontends

Existen tres aplicaciones frontend (`frontend/`, `Homepage/`, `Apartado Medico/`). Los pasos para configurar cada una son similares. A continuación, se describe el proceso general, que deberá repetirse para cada una de ellas, ajustando los nombres de directorio.

**Para cada aplicación frontend (ej. `frontend/`):**

1.  **Navegar al Directorio Específico:**
    *   Para la aplicación principal: `cd frontend`
    *   Para la página de inicio: `cd Homepage`
    *   Para el apartado médico: `cd "Apartado Medico"` (las comillas son importantes si el directorio tiene espacios y se usa en la terminal).

2.  **Crear Archivo de Entorno Local:**
    *   Busque un archivo de ejemplo como `.env.local.example`. Si existe, cópielo a un nuevo archivo llamado `.env.local`.
    *   Si no existe un archivo de ejemplo, cree un archivo `.env.local` manualmente.
    *   Dentro de `.env.local`, configure la variable `NEXT_PUBLIC_API_URL` para que apunte a la URL completa de su backend. Por ejemplo:
        ```
        NEXT_PUBLIC_API_URL=http://localhost:3001/api
        ```
        (Ajuste el puerto `3001` si su API se ejecuta en un puerto diferente).

3.  **Instalar Dependencias:**
    *   Revise si existe un archivo `package-lock.json` (para npm) o `pnpm-lock.yaml` (para pnpm) o `yarn.lock` (para yarn).
    *   Use el gestor de paquetes correspondiente:
        *   Si usa npm: `npm install`
        *   Si usa pnpm (detectado en `Apartado Medico` y `Homepage` por la presencia de `pnpm-lock.yaml`): `pnpm install`
        *   Si usa yarn: `yarn install`
    *   Si no está seguro, `npm install` es una opción común.

4.  **Iniciar la Aplicación de Desarrollo:**
    *   Generalmente, el comando es:
        ```bash
        npm run dev
        ```
        (O `pnpm run dev` o `yarn dev` según el gestor de paquetes).
    *   La aplicación web estará disponible en una URL local, comúnmente `http://localhost:3000`. El `README.md` menciona `http://localhost:3003` para `frontend/`. Verifique la salida de la consola al ejecutar el comando, ya que el puerto puede variar o ser configurado en `package.json`.

**Nota sobre los puertos:** Es posible que cada aplicación frontend esté configurada para ejecutarse en un puerto diferente para evitar conflictos si se ejecutan simultáneamente. Consulte los archivos `package.json` dentro de cada directorio de frontend (en la sección `scripts`) para ver los comandos exactos y posibles configuraciones de puerto.

## 6. Uso Básico de la Aplicación

### 6.1. Para Pacientes

1.  **Registro:** Acceda a la página de registro y complete el formulario con sus datos personales.
2.  **Inicio de Sesión:** Utilice sus credenciales para acceder a su panel.
3.  **Ver/Añadir Dependientes:** Si tiene menores a cargo, navegue a la sección correspondiente para añadirlos o ver su información.
4.  **Buscar Centros:** Explore la lista o mapa de centros de vacunación.
5.  **Agendar Cita:** Seleccione un centro, elija una fecha y hora disponibles, y confirme la cita para usted o un dependiente.
6.  **Consultar Historial:** Revise su historial de vacunación y el de sus dependientes.

### 6.2. Para Personal Médico

1.  **Inicio de Sesión:** Acceda con sus credenciales de personal médico.
2.  **Gestionar Disponibilidad:** Configure sus horarios de atención en la sección de disponibilidad.
3.  **Ver Citas:** Consulte la lista de citas programadas para usted.
4.  **Atender Cita:**
    *   Al llegar un paciente, búsquelo en su lista de citas.
    *   Verifique sus datos y los de la vacuna a aplicar.
    *   Registre la vacunación, seleccionando el lote de vacuna utilizado.
    *   Añada cualquier nota relevante.
5.  **Consultar Historial del Paciente:** Si es necesario, revise el historial de vacunación del paciente que está atendiendo.

### 6.3. Para Administradores

1.  **Inicio de Sesión:** Acceda con sus credenciales de administrador.
2.  **Panel de Administración:** Navegue por las diferentes secciones:
    *   **Usuarios:** Crear nuevas cuentas, modificar roles, etc.
    *   **Centros:** Añadir nuevos centros, editar existentes, asignar personal.
    *   **Vacunas (Catálogo):** Gestionar los tipos de vacunas disponibles.
    *   **Inventario (Lotes):** Añadir nuevos lotes de vacunas, asignarlos a centros, monitorear stock.
    *   **Dashboard/Reportes:** Visualizar estadísticas del sistema.

## 7. Tecnologías Utilizadas

*   **Frontend:**
    *   Next.js (Framework React)
    *   TypeScript
    *   Tailwind CSS
    *   Shadcn/UI (Librería de componentes)
    *   React Query o SWR (posiblemente para data fetching y caching, inferido por `use-api.ts`)
*   **Backend:**
    *   Node.js
    *   Express.js (Framework para API)
    *   JavaScript (con `require` para módulos)
    *   MSSQL (Driver para SQL Server)
    *   JSON Web Tokens (JWT) para autenticación
    *   Dotenv (para gestión de variables de entorno)
*   **Base de Datos:**
    *   Microsoft SQL Server
    *   SQL (Lenguaje de consulta estructurado)
    *   Procedimientos Almacenados T-SQL

## 8. Scripts Disponibles

### Frontend (ej. en `frontend/`, `Homepage/`, `Apartado Medico/`)

*   `npm run dev`: Inicia el servidor de desarrollo de Next.js.
*   `npm run build`: Compila la aplicación para un entorno de producción.
*   `npm run start`: Inicia un servidor de producción después de compilar.

### Backend (`api/`)

*   `npm start`: Inicia el servidor de la API Node.js/Express.

---

Esta guía proporciona una visión general para comenzar a utilizar y entender el Sistema de Gestión de Vacunación. Para funcionalidades más específicas o solución de problemas avanzados, puede ser necesario consultar directamente el código fuente o la documentación técnica asociada si existe.## 9. Flujo de Datos y Comunicación

1.  **Interacción del Usuario (Frontend):** El usuario (paciente, médico, admin) interactúa con la interfaz web construida con Next.js y React.
2.  **Llamada a la API (Frontend):** Las acciones del usuario desencadenan llamadas a la API. El hook `useApi` (en `frontend/hooks/use-api.ts`) gestiona estas llamadas, adjuntando el token de autenticación (JWT) si el usuario está logueado y enviando la petición al backend. La URL base de la API se configura mediante la variable de entorno `NEXT_PUBLIC_API_URL`.
3.  **Recepción de la Petición (Backend):** El servidor Express.js (`api/index.js`) recibe la petición HTTP.
4.  **Middleware (Backend):**
    *   Pasa por middlewares globales como `cors` y `express.json()`.
    *   El middleware `authMiddleware.js` (`verifyToken` y `checkRole`) intercepta las peticiones a rutas protegidas para verificar la validez del JWT y, en algunos casos, si el usuario tiene el rol adecuado para acceder al recurso.
5.  **Enrutamiento (Backend):** La petición se dirige al manejador de ruta correspondiente definido en `api/routes/`.
6.  **Lógica de Negocio (Backend/Database):**
    *   El manejador de ruta ejecuta la lógica de negocio.
    *   Para operaciones con la base de datos, el backend utiliza el driver `mssql` para conectarse a SQL Server (configuración en `api/config/db.js`).
    *   Frecuentemente, en lugar de escribir SQL directamente en el backend, se ejecutan **procedimientos almacenados** definidos en `database/programmability/`. Esto encapsula la lógica de acceso y manipulación de datos directamente en la base de datos, lo cual puede mejorar el rendimiento, la seguridad y la mantenibilidad.
7.  **Respuesta de la Base de Datos (Database):** SQL Server procesa la consulta o el procedimiento almacenado y devuelve los resultados al backend.
8.  **Respuesta de la API (Backend):** El backend formatea la respuesta (generalmente en JSON) y la envía de vuelta al frontend.
9.  **Actualización de la UI (Frontend):** El frontend recibe la respuesta. El hook `useApi` actualiza su estado (datos, error, carga), y los componentes de React se re-renderizan para mostrar la nueva información o el resultado de la operación al usuario.

Este flujo asegura una separación clara de responsabilidades entre la presentación (frontend), la lógica de negocio (backend) y el almacenamiento de datos (database).
