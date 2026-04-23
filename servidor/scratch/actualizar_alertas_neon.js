const { Pool } = require('pg');
const connectionString = 'postgresql://neondb_owner:npg_og0AOMZ3yrKN@ep-royal-waterfall-am3k3uqo-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });

async function actualizarAlertas() {
    console.log('🚀 Actualizando tabla de ALERTAS en Neon...');
    try {
        await pool.query(`
            ALTER TABLE alertas_tempranas 
            ADD COLUMN IF NOT EXISTS archivo_docente_nombre VARCHAR(255),
            ADD COLUMN IF NOT EXISTS archivo_docente_ruta VARCHAR(500);
        `);
        console.log('✅ Campos para archivos de docentes añadidos con éxito.');
    } catch (e) {
        console.error('❌ Error en Neon:', e.message);
    } finally {
        await pool.end();
    }
}

actualizarAlertas();
