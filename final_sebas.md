# 📝 Plan de Finalización: Tesis Bienestar Estudiantil - ISTPET

## 1. ¿Qué tenemos hasta hoy? (Cimientos Listos)
*   **Infraestructura Cloud:** El sistema ya vive en internet (**Vercel**) y la base de datos está en la nube (**Neon.tech**).
*   **Limpieza de Código:** Eliminamos todo el código viejo de "formatos" y roles que no servían. El sistema es 100% estable ahora.
*   **Base de Datos Reseteada:** Tenemos las tablas esenciales (`usuarios`, `estudiantes`, `alertas_tempranas`) listas para recibir datos nuevos.
*   **Autenticación:** El sistema de login ya funciona para el rol de Bienestar Estudiantil.

---

## 2. Plan de Trabajo por Fases (Lo que falta)

### Fase 1: Panel de Control (Dashboard)
*   **Objetivo:** Crear una interfaz profesional que impacte visualmente.
*   **Tareas:**
    *   Diseñar el menú lateral con las opciones: Inicio, Alumnos, Alertas, Reportes.
    *   Crear "Tarjetas de Resumen" (Total Alumnos, Alertas Críticas, Casos Resueltos).
    *   Gráfico de rendimiento general por carrera.

### Fase 2: Expediente Digital Estudiantil
*   **Objetivo:** Centralizar toda la información de los alumnos del ISTPET.
*   **Tareas:**
    *   **Módulo de Carga Masiva:** Poder subir un Excel con la lista de alumnos.
    *   **Ficha Técnica:** Vista detallada de cada alumno (Datos, Foto, Historial Académico).
    *   **Buscador:** Filtro rápido por nombre o cédula.

### Fase 3: Gestión y Control de Alertas (El Corazón)
*   **Objetivo:** Digitalizar el trabajo manual que antes hacían en papel o Excel.
*   **Tareas:**
    *   **Registro de Alertas:** Formulario para reportar alumnos con bajo desempeño.
    *   **Flujo de Seguimiento:** Poder cambiar el estado de la alerta (Pendiente -> En Intervención -> Caso Cerrado).
    *   **Gestión de Evidencias:** Subir documentos o fotos que respalden el trabajo de Bienestar.

### Fase 4: Reportes y Cierre
*   **Objetivo:** Generar los documentos finales para la defensa de tesis.
*   **Tareas:**
    *   Generador de Reportes Estadísticos (Excel/PDF).
    *   Manual de Usuario para el Departamento de Bienestar.

### Fase 5: Módulo de Configuración y Autonomía (CMS)
*   **Objetivo:** Que Bienestar pueda editar el sistema sin depender del programador.
*   **Tareas:**
    *   **Editor de Contenido:** Panel para cambiar textos de la página principal (misión, visión, etc.).
    *   **Gestión de Perfil Institucional:** Cambiar correos, teléfonos y logos.
    *   **Gestión de Formatos Oficiales (15 documentos):** 
        *   Repositorio para subir y actualizar las 12 plantillas de seguimiento y 3 de becas.
        *   Configuración de campos dinámicos para llenado automático.
    *   **Administración de Usuarios:** Crear o desactivar cuentas de acceso al panel.

---

## 3. Próximo Paso Inmediato
Mi recomendación es empezar con la **Fase 1 (El Dashboard)**. Necesitamos que el sistema "se vea" como un producto terminado para que puedas mostrar avances reales a tu tutor.
