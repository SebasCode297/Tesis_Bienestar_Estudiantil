const { Pool } = require('pg');
const connectionString = 'postgresql://neondb_owner:npg_og0AOMZ3yrKN@ep-royal-waterfall-am3k3uqo-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });

async function migrarNeon() {
    console.log('🚀 Iniciando migración en NEON...');
    try {
        // 1. Añadir columnas si no existen
        await pool.query(`
            ALTER TABLE formatos ADD COLUMN IF NOT EXISTS descripcion TEXT;
            ALTER TABLE formatos ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT TRUE;
        `);
        console.log('✅ Columnas descripcion y activo verificadas en Neon.');

        // 2. Población de descripciones profesionales (15 formatos)
        const descripciones = {
            'ANEXO 1 - OFICIO': 'Carta formal institucional para el inicio de trámites de beca ante las autoridades.',
            'ANEXO 2 - SOLICITUD': 'Formulario oficial de petición de beca por parte del estudiante.',
            'FICHA SOCIOECONÓMICA': 'Evaluación integral de la situación económica y familiar del estudiante.',
            'ACTA DE REUNIÓN U.B.I.': 'Registro legal de las sesiones y acuerdos de la Unidad de Bienestar Institucional.',
            'FICHA ACUERDO-COMPROMISO': 'Documento de compromiso académico y disciplinario del estudiante.',
            'FICHA DE ACOMPAÑAMIENTO - Formato': 'Seguimiento periódico del proceso de acompañamiento psicológico o pedagógico.',
            'FICHA DE JUSTIFICACIÓN DE FALTAS': 'Gestión de inasistencias justificadas por motivos médicos o personales.',
            'FORMATO - FICHA DE SOLICITUD DE ATENCIÓN': 'Petición formal de servicios del departamento de Bienestar.',
            'FORMATO - INFORME DE SEGUIMIENTO DE ACOMPAÑAMIENTO Y CONTROL PEDAGÓGICO-DOCENTES': 'Información del docente sobre el progreso del estudiante con alerta.',
            'FORMATOS': 'Repositorio general de formatos y documentos institucionales.',
            'INFORME DE BIENESTAR ESTUDIANTIL': 'Reporte consolidado de la situación del estudiante para las autoridades.',
            'INFORME DE CIERRE DEL PROCESO DE ACOMPAÑAMIENTO': 'Certificación oficial de finalización de intervención y atención.',
            'REGISTRO DE ATENCIÓN A ESTUDIANTES': 'Bitácora de control de concurrencia al departamento.',
            'REGISTRO DE DESERCIÓN': 'Formalización de salida definitiva del estudiante del instituto.',
            'SOLICITUD ESTUDIANTE-CONVENIO': 'Trámites para estudiantes amparados en convenios interinstitucionales.'
        };

        for (const [nombre, desc] of Object.entries(descripciones)) {
            await pool.query('UPDATE formatos SET descripcion = $1 WHERE nombre = $2', [desc, nombre]);
        }
        console.log('✅ Descripciones sincronizadas en la nube.');

    } catch (e) {
        console.error('❌ Error migrando Neon:', e.message);
    } finally {
        await pool.end();
        console.log('🏁 Proceso terminado.');
    }
}

migrarNeon();
