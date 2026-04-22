/**
 * Añade columnas JSON usadas por el asistente y respuestas (si no existen).
 * Ejecutar: node migrar_wizard_campos.js
 */
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PUERTO,
    user: process.env.DB_USUARIO,
    password: process.env.DB_CONTRASENA,
    database: process.env.DB_NOMBRE
});

async function run() {
    try {
        await pool.query('ALTER TABLE formatos ADD COLUMN IF NOT EXISTS campos_json JSONB');
        await pool.query('ALTER TABLE estudiante_formatos ADD COLUMN IF NOT EXISTS respuestas_json JSONB');
        console.log('✅ Columnas campos_json / respuestas_json verificadas.');
    } catch (e) {
        console.error('❌', e.message);
    } finally {
        await pool.end();
    }
}

run();
