# Análisis del Sistema de Gestión de Bienestar Estudiantil — ISTPET

Este documento detalla la estructura, tecnologías y arquitectura del sistema desarrollado para el Departamento de Bienestar Estudiantil del Instituto Superior Tecnológico Nelson Torres (ISTPET).

## 1. Propósito del Sistema
El sistema tiene como objetivo automatizar la gestión, control y seguimiento del desempeño académico de los estudiantes, facilitando la detección temprana de alertas y la generación automatizada de documentos administrativos requeridos por el departamento.

## 2. Tecnologías Utilizadas

### Backend (Servidor)
*   **Entorno de Ejecución:** Node.js
*   **Framework Web:** Express.js
*   **Base de Datos:** PostgreSQL
*   **Autenticación:** express-session & bcryptjs
*   **Generación de Documentos:** docxtemplater & pizzip (para manipular archivos .docx)
*   **Gestión de Archivos:** multer
*   **Procesamiento de Datos:** xlsx (lectura de archivos Excel)

### Frontend (Cliente)
*   **Lenguajes:** HTML5, CSS3, JavaScript (Vanilla / ES6+)
*   **Estilos:** CSS3 nativo (sin frameworks pesados para mayor control)
*   **Comunicación:** Fetch API para peticiones asíncronas al servidor

---

## 3. Arquitectura del Sistema
El sistema sigue una **arquitectura de 3 capas**, lo que facilita el mantenimiento y la escalabilidad:

1.  **Capa de Presentación (Frontend):** Ubicada en la carpeta `cliente/`. Contiene la interfaz de usuario:
    *   `bienestar/`: Interfaz completa para administradores de Bienestar Estudiantil.
    *   `inicio/`: Página de aterrizaje y acceso inicial.

2.  **Capa de Negocio (Backend):** Ubicada en la carpeta `servidor/`.
    *   `app.js`: Punto de entrada y configuración global.
    *   `rutas/`: Define los endpoints de la API.
    *   `controladores/`: Contiene la lógica lógica de negocio y validaciones.
    *   `middlewares/`: Manejo de sesiones y protección de rutas.

3.  **Capa de Datos:**
    *   `modelos/`: Consultas SQL directas a PostgreSQL utilizando el driver `pg`.
    *   `base_datos/`: Scripts de creación de tablas y estructura de la DB.

---

## 4. Módulos Principales

### A. Autenticación Administrador
Gestión de accesos centralizada para el Administrador de Bienestar Estudiantil.

### B. Gestión de Estudiantes
Módulo para registrar, importar (vía Excel) y listar estudiantes con sus respectivos datos personales y académicos para su seguimiento y generación de documentos.

### C. Generador de Documentos Wizard
Permite subir plantillas de Word (.docx) con etiquetas especiales (ej: `{nombre_estudiante}`), las cuales el sistema rellena automáticamente con datos de la base de datos para generar documentos finales.

### D. Sistema de Alertas
Visualización y gestión de alertas académicas o de riesgo que requieren atención por parte del departamento.

### E. Reportes
Generación de estadísticas y resúmenes de la gestión de bienestar para la toma de decisiones.

---

## 5. Estructura de Archivos (Resumen)

```text
/
├── cliente/                # Capa de presentación (HTML/CSS/JS)
│   ├── bienestar/          # Dashboard de administración central
├── servidor/               # Capa de negocio y servidor
│   ├── controladores/      # Lógica de administración
│   ├── rutas/              # Endpoints de la API
│   ├── modelos/            # Consultas a la base de datos
│   ├── app.js              # Archivo principal Express
│   └── package.json        # Dependencias y scripts
├── base_datos/             # Scripts SQL y respaldo
└── isistema.md             # Este archivo informativo
```
