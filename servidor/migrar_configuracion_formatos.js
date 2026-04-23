// =============================================
// migrar_configuracion_formatos.js
// Añade columnas descriptivas para la autogestión
// =============================================
const pool = require('./config/baseDatos');

async function migrar() {
    try {
        console.log('🔄 Iniciando migración de tabla formatos...');
        
        // Añadir columna descripción si no existe
        await pool.query(`
            ALTER TABLE formatos 
            ADD COLUMN IF NOT EXISTS descripcion TEXT,
            ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT TRUE
        `);
        
        console.log('✅ Columnas "descripcion" y "activo" añadidas correctamente.');

        // Actualizar descripciones iniciales para que el sistema no se vea vacío
        const descripciones = {
            'ANEXO 1 - OFICIO': 'Carta formal para respaldo de trámites de beca.',
            'ANEXO 2 - SOLICITUD': 'Formulario de solicitud de ingreso al programa de becas.',
            'FICHA SOCIOECONÓMICA': 'Recopilación de datos de vulnerabilidad del estudiante.',
            'ACTA DE REUNIÓN U.B.I.': 'Registro oficial de sesiones de la Unidad de Bienestar.',
            'FICHA ACUERDO-COMPROMISO': 'Compromiso de mejora académica o conductual.',
            'FICHA DE ACOMPAÑAMIENTO - Formato': 'Seguimiento de intervención psicológica/pedagógica.',
            'FICHA DE JUSTIFICACIÓN DE FALTAS': 'Gestión de inasistencias por salud o calamidad.',
            'FORMATO - FICHA DE SOLICITUD DE ATENCIÓN': 'Solicitud de atención especializada al departamento.',
            'FORMATO - INFORME DE SEGUIMIENTO DE ACOMPAÑAMIENTO Y CONTROL PEDAGÓGICO-DOCENTES': 'Reporte de retroalimentación docente sobre alertas.',
            'INFORME DE BIENESTAR ESTUDIANTIL': 'Resumen integral de la situación del estudiante.',
            'INFORME DE CIERRE DEL PROCESO DE ACOMPAÑAMIENTO': 'Alta formal de un caso de seguimiento.',
            'REGISTRO DE ATENCIÓN A ESTUDIANTES': 'Control diario de visitas al departamento.',
            'REGISTRO DE DESERCIÓN': 'Formalización del retiro definitivo del estudiante.',
            'SOLICITUD ESTUDIANTE-CONVENIO': 'Gestión para alumnos amparados bajo convenios.'
        };

        for (const [nombre, desc] of Object.entries(descripciones)) {
            await pool.query(
                'UPDATE formatos SET descripcion = $1 WHERE nombre = $2 AND descripcion IS NULL',
                [desc, nombre]
            );
        }

        console.log('✅ Descripciones iniciales actualizadas.');
        
    } catch (error) {
        console.error('❌ Error en la migración:', error.message);
    } finally {
        pool.end();
    }
}

migrar();
