# Plan de Implementación: Sistema de Gestión Académica - Bienestar Estudiantil (ISTPET)

Este documento detalla la hoja de ruta para transformar los procesos manuales del departamento de Bienestar Estudiantil en un sistema web digital, centralizado y eficiente.

## 1. Visión del Proyecto
Digitalizar la "Carpeta de Bienestar" de cada estudiante. El sistema permitirá al administrador de Bienestar Estudiantil registrar, monitorear y realizar intervenciones sobre el desempeño académico y bienestar integral de los estudiantes del ISTPET.

---

## 2. Fases de Desarrollo

### Fase 1: El Expediente Digital Único (Ficha del Estudiante)
*Sustituye a la ficha física en papel.*
* **Funcionalidad:** Un buscador central donde el administrador encuentra al estudiante y ve su perfil completo.
* **Datos:** Información personal, socioeconómica, y un historial rápido de sus notas/asistencia.
* **Acción:** Botón para "Iniciar Seguimiento" si se detecta un problema.

### Fase 2: Módulo de Casos y Seguimiento (El Corazón del Sistema)
*Sustituye a la bitácora manual de visitas.*
* **Gestión de Casos:** Lista de estudiantes que están "En Observación".
* **Registro de Bitácora:** Formulario para anotar cada vez que el estudiante va a Bienestar (motivo, fecha, observaciones).
* **Estados del Caso:** Definir si el estudiante está: *En Riesgo, En Proceso de Mejora, o Caso Cerrado (Éxito).*

### Fase 3: Digitalización de Compromisos y Acuerdos
*Sustituye a los formatos impresos que firman los alumnos.*
* **Generación de Acuerdos:** Un editor simple para redactar compromisos académicos (ej: "El estudiante se compromete a asistir a tutorías").
* **Archivo Digital:** Opción para subir fotos o PDFs de documentos firmados físicamente para que queden guardados en la ficha digital del alumno.

### Fase 4: Panel de Inteligencia (Dashboard de Bienestar)
*Sustituye al análisis manual de datos.*
* **Alertas Automáticas:** El sistema resalta automáticamente a los estudiantes con promedios bajos para que Bienestar los llame.
* **Estadísticas de Gestión:** ¿Cuántos casos se atendieron este mes? ¿Cuál es el motivo más común de deserción?

---

## 3. Flujo de Trabajo (Stack Tecnológico)
* **Base de Datos:** PostgreSQL en **Neon.tech** (Datos persistentes y seguros).
* **Backend:** Node.js desplegado en **Vercel** (Funciones serverless).
* **Frontend:** HTML, CSS (Vanilla) y JS (Interfaz rápida, moderna y responsiva).
* **Control de Versiones:** Git (GitHub) sincronizado con el despliegue automático.

---

## 4. Opciones de Inicio Inmediato
Para empezar hoy mismo, estas son las opciones de programación (cuando tú me des el visto bueno):
1. **Opción A:** Crear la estructura de la base de datos en Neon para la "Ficha del Estudiante".
2. **Opción B:** Diseñar el Layout principal del Panel Administrativo (Menú lateral, área de trabajo y buscador).
3. **Opción C:** Definir la lógica de "Alertas de Desempeño" (¿A partir de qué nota el sistema debe avisar a Bienestar?).
