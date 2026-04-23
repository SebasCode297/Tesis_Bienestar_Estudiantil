# Plan de Seguimiento y Finalización: Sistema de Gestión Bienestar Estudiantil ISTPET

Este documento detalla la hoja de ruta para integrar el nuevo **Módulo de Configuración** y finalizar los requerimientos de la tesis de "Gestión y Control del Desempeño Académico".

## 1. Estado Actual del Sistema (Lo que ya tenemos)
*   ✅ **Login**: Funcional con sesiones seguras para Bienestar.
*   ✅ **Estudiantes**: Carga masiva desde Excel y lista con historial individual.
*   ✅ **Alertas**: Sistema de recepción de alertas de docentes y gestión de estados (Pendiente, Proceso, Resuelto).
*   ✅ **Formatos (Repositorio)**: Actualmente funcional pero con nombres y categorías fijos en el código.

---

## 2. Nueva Fase: Módulo de Configuración (Autogestión Personalizada)
Este cambio hará que el sistema no dependa de un programador para cambios menores.

### Paso 1: Re-estructuración del Backend (Servidor)
*   **Objetivo**: Que los formatos dejen de ser un "listado fijo" y pasen a ser objetos con propiedades editables.
*   Modificar la base de datos para que cada formato tenga: `nombre`, `descripcion`, `categoria` (Beca/Seguimiento) y `ruta_archivo`.
*   Crear rutas de API para subir, editar y borrar estos formatos desde la interfaz.

### Paso 2: Interfaz de Administración (Panel de Control)
*   Crear una nueva sección llamada **"Configuración"** en el menú lateral.
*   Diseñar una tabla donde el usuario pueda:
    *   **Subir nuevos formatos**: Si el instituto crea un nuevo proceso, ella lo agrega sola.
    *   **Actualizar Plantillas**: Si un formulario de Beca cambia, ella sube el nuevo Word y el sistema se actualiza automáticamente.
    *   **Descripciones**: Poder explicar para qué sirve cada documento desde la web.

### Paso 3: Vinculación Dinámica
*   El "Asistente de Llenado" (Wizard) y las tarjetas del panel se cargarán dinámicamente consultando la base de datos, no archivos fijos.

---

## 3. Requerimientos Finales para la Tesis
Para asegurar una nota excelente en la defensa, completaremos:

### A. Reportes Detallados de Control
*   Visualizar estadísticas por carrera y semestre.
*   Reporte de "Eficacia": Comparar alertas recibidas vs resueltas para medir la gestión de Bienestar.

### B. Seguridad y Feedback
*   Mensajes de confirmación visuales (Ej: "Formato actualizado con éxito").
*   Protección de rutas de configuración para que solo el administrador tenga acceso.

### C. Pulido Estético (Efecto "WOW")
*   Mejorar las transiciones entre vistas para que se sienta como una aplicación moderna y fluida.
*   Optimización de la carga de archivos masivos.

---

| fase | objetivo | resultado para la tesis |
| :--- | :--- | :--- |
| **fase 1** | servidor dinámico | sistema escalable y administrable. |
| **fase 2** | panel de configuración | autonomía del usuario final. |
| **fase 3** | reportes avanzados | herramientas de toma de decisiones. |
| **fase 4** | optimización final | producto de software profesional. |

---

**Nota**: Este plan garantiza que mantengamos la funcionalidad actual mientras añadimos la capa administrativa que solicitaste.
