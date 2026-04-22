const { Pool } = require('pg');
const pool = new Pool({ host: 'localhost', user: 'postgres', password: '1234', database: 'bienestar_estudiantil', port: 5432 });
async function run() {
    try {
        console.log('Intentando ALTER TABLE...');
        await pool.query("ALTER TABLE estudiante_formatos ADD COLUMN IF NOT EXISTS finalizado_en TIMESTAMP;");
        console.log('✅ ALTER TABLE exitoso.');
    } catch (e) {
        console.error('❌ Error migrando:', e.message);
    } finally {
        process.exit();
    }
}
run();
