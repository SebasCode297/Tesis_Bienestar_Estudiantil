const { Pool } = require('pg');
const pool = new Pool({ host: 'localhost', user: 'postgres', password: '1234', database: 'bienestar_estudiantil', port: 5432 });
async function run() {
    try {
        const res = await pool.query("SELECT id, nombre, archivo_nombre, archivo_ruta FROM formatos ORDER BY id ASC;");
        console.log(JSON.stringify(res.rows, null, 2));
    } finally {
        process.exit();
    }
}
run();
