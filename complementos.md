# Complementos y Tareas Pendientes

Tras la reestructuración del sistema a un **único rol (Bienestar Estudiantil)** y la eliminación de iconos, se han identificado los siguientes puntos que faltan trabajar o pulir para que el sistema sea 100% coherente con la nueva arquitectura:

## 1. Entrada de Alertas Manuales
- **Problema:** El sistema recibía alertas grabadas por Docentes. Al eliminar el acceso para Docentes, ya no hay quién "envíe" la alerta digitalmente.
- **Acción Pendiente:** Crear un formulario dentro del panel de Bienestar para que el administrador pueda registrar manualmente las alertas que recibe por canales físicos o externos (oficios, WhatsApp, etc.).

## 2. Limpieza de Base de Datos (Estructura)
- **Problema:** Tablas como `alertas_tempranas` aún tienen la columna `docente_id`.
- **Acción Pendiente:** Decidir si se elimina esa columna o se renombra a algo como `id_informante` (texto libre para poner el nombre de quien reporta la alerta, ya que no habrá un ID de usuario docente vinculado).

## 3. Gestión de Usuarios (Admins)
- **Problema:** Actualmente solo hay una cuenta de Bienestar Estudiantil.
- **Acción Pendiente:** Implementar un módulo para que el administrador principal pueda crear otras cuentas con acceso al mismo panel de Bienestar (en lugar de compartir una sola contraseña).

## 4. Revisión del Asistente de Llenado (Wizard)
- **Problema:** Es posible que dentro del proceso de generación de documentos (paso a paso) aún queden símbolos o iconos antiguos que no se han detectado.
- **Acción Pendiente:** Hacer una auditoría visual profunda en cada uno de los 15 formatos para asegurar que el diseño sea puramente textual y minimalista.

## 5. Optimización de la Página de Inicio
- **Problema:** La página principal ahora solo tiene un acceso. Queda mucho espacio libre.
- **Acción Pendiente:** Añadir una sección informativa o de contacto rápida del departamento para que el estudiante (que ya no tiene login) sepa a dónde acudir físicamente o a qué correo escribir si tiene un problema.

## 6. Eliminación de Código Obsoleto (Controladores)
- **Problema:** Aunque ya no se usan las rutas, los archivos físicos de `docenteControlador.js` y `estudianteControlador.js` podrían seguir en la carpeta.
- **Acción Pendiente:** Eliminar físicamente los archivos que ya no tienen ninguna función para mantener el servidor ligero.

## 7. Migración de Contraseñas
- **Problema:** Los estudiantes ya no inician sesión, pero siguen teniendo una contraseña en la DB ocupando espacio y recursos.
- **Acción Pendiente:** Evaluar si se elimina la columna `contrasena` de la tabla `estudiantes` para simplificar la gestión de datos.

---
**Nota:** Ninguna de estas tareas ha sido programada todavía. Quedan a la espera de tu aprobación.
