/**
 * FICHA DE JUSTIFICACIÓN DE FALTAS — definición del asistente de llenado.
 * 
 * Las etiquetas actuales del .docx son:
 *   [[NOMBRE]], [[APELLIDO]], [[CONTACTO]], [[CARRERA]], [[SEMESTRE]], [[FECHA_EMISION]]
 * 
 * Además se definen campos para:
 *   - Situación identificada
 *   - Detalle de la dificultad
 *   - Resolución
 *   - Remisión a departamento médico
 * 
 * Para que se reflejen en el Word, agrega estas etiquetas en la plantilla:
 *   [[SITUACION]], [[DETALLE]], [[RES_JUSTIFICACION]], [[RES_EVALUACIONES]],
 *   [[RES_ENTREGA_TAREAS]], [[REMISION_VERIFICACION]]
 * 
 * Si modificas el .docx, actualiza aquí y ejecuta poblar_campos_total.js.
 */
module.exports = {
    tituloDocumento: 'Ficha de justificación de faltas',
    pasos: [
        {
            titulo: '1. Datos informativos del estudiante',
            descripcion: 'Coinciden con los campos variables de la plantilla oficial cargada en Formatos del sistema.',
            campos: [
                { id: 'nombres', label: 'Nombres', placeholder: '[[NOMBRE]]', tipo: 'texto' },
                { id: 'apellidos', label: 'Apellidos', placeholder: '[[APELLIDO]]', tipo: 'texto' },
                { id: 'contacto', label: 'Contacto del estudiante', placeholder: '[[CONTACTO]]', tipo: 'texto' }
            ]
        },
        {
            titulo: '2. Datos académicos y fecha',
            descripcion: 'Carrera, semestre y fecha de emisión según la plantilla.',
            campos: [
                { id: 'carrera', label: 'Carrera', placeholder: '[[CARRERA]]', tipo: 'texto' },
                { id: 'semestre', label: 'Semestre', placeholder: '[[SEMESTRE]]', tipo: 'texto' },
                { id: 'fecha_emision', label: 'Fecha de emisión', placeholder: '[[FECHA_EMISION]]', tipo: 'texto' }
            ]
        },
        {
            titulo: '3. Situación identificada',
            descripcion: 'Registre la situación académica (por ejemplo: Inasistencias).',
            campos: [
                { id: 'situacion', label: 'Situación académica / tipo de dificultad', placeholder: '[[SITUACION]]', tipo: 'texto' }
            ]
        },
        {
            titulo: '4. Detalle de la dificultad identificada',
            descripcion: 'Describa el motivo, periodo de faltas y cualquier detalle relevante.',
            campos: [
                { id: 'detalle', label: 'Detalle de la dificultad (texto completo del párrafo)', placeholder: '[[DETALLE]]', tipo: 'area_texto' }
            ]
        },
        {
            titulo: '5. Resolución',
            descripcion: 'Redacte manualmente la resolución completa que debe constar en el informe.',
            campos: [
                { id: 'resolucion_texto', label: 'Resolución (texto libre, puede incluir viñetas o acuerdos)', placeholder: '[[RESOLUCION]]', tipo: 'area_texto' }
            ]
        },
        {
            titulo: '6. Remisión a departamento médico',
            descripcion: 'Describa manualmente si existe remisión y a qué se remite al estudiante.',
            campos: [
                { id: 'remision_texto', label: 'Remisión a departamento médico (texto libre)', placeholder: '[[REMISION]]', tipo: 'area_texto' }
            ]
        }
    ]
};
