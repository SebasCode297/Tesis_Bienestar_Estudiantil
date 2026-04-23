const { Pool } = require('pg');
const pool = new Pool({ host: 'localhost', user: 'postgres', password: '1234', database: 'bienestar_estudiantil', port: 5432 });
async function run() {
    try {
        const res = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'formatos';");
        console.log(JSON.stringify(res.rows.map(r => r.column_name), null, 2));
    } finally {
        process.exit();
    }
}
run();
