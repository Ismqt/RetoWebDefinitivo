# Changelog - 16 de Junio, 2025

Resumen de los cambios y correcciones implementadas para mejorar la funcionalidad del sistema de gestión de vacunación.

---

### 1. Corrección de Visualización de Lotes de Vacunas

- **Problema:** La tabla de inventario no mostraba los lotes de vacunas existentes para un centro, a pesar de que la API de backend los enviaba correctamente.

- **Diagnóstico:** Se descubrió que el componente del frontend intentaba solicitar los datos de los lotes *antes* de que el sistema de autenticación hubiera terminado de cargar la información del usuario. Esto causaba que la llamada a la API se realizara sin un `id_CentroVacunacion` válido o que se cancelara prematuramente.

- **Solución (Frontend - `InventoryTabContent.tsx`):**
    - Se refactorizó el componente para que la llamada a la API espere explícitamente a que finalice la carga de la autenticación (`authLoading === false`).
    - Se añadió la importación del hook `useCallback` que faltaba, resolviendo un error de renderizado.
    - Se eliminó un `useEffect` con `setTimeout` que provocaba llamadas prematuras y poco fiables a la API.

- **Resultado:** Los lotes de vacunas ahora se cargan y muestran de manera fiable en la tabla de inventario tan pronto como el usuario inicia sesión.

### 2. Corrección en Creación de Disponibilidad

- **Problema:** Al intentar guardar un nuevo horario de disponibilidad, la API devolvía un error `SyntaxError: ... is not valid JSON`.

- **Diagnóstico:** El formulario del frontend estaba convirtiendo el objeto de datos a formato JSON (`JSON.stringify`) *antes* de pasarlo al hook `useApi`. Este hook, a su vez, volvía a realizar la misma conversión, resultando en un JSON doblemente codificado que el backend no podía interpretar.

- **Solución (Frontend - `AvailabilityForm.tsx`):**
    - Se eliminó la llamada manual a `JSON.stringify()` en la función `onSubmit`.
    - Ahora, el objeto con los datos del formulario se pasa directamente al hook `useApi`, que se encarga de la serialización correcta.

- **Resultado:** La creación de nuevos horarios de disponibilidad funciona correctamente sin errores de formato.
