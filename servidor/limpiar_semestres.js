const { Pool } = require('pg');
const pool = new Pool({ host: 'localhost', user: 'postgres', password: '1234', database: 'bienestar_estudiantil', port: 5432 });
async function run() {
    try {
        await pool.query("UPDATE estudiantes SET semestre = '1' WHERE semestre IN ('1ro', '1ero', '1', '1°');");
        await pool.query("UPDATE estudiantes SET semestre = '2' WHERE semestre IN ('2do', '2', '2°');");
        await pool.query("UPDATE estudiantes SET semestre = '3' WHERE semestre IN ('3ro', '3ero', '3', '3°');");
        await pool.query("UPDATE estudiantes SET semestre = '4' WHERE semestre IN ('4to', '4', '4°');");
        console.log('✅ Datos históricos normalizados exitosamente.');
    } catch (e) {
        console.error('❌ Error:', e);
    } finally {
        process.exit();
    }
}
run();
