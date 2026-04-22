require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PUERTO,
    user: process.env.DB_USUARIO,
    password: process.env.DB_CONTRASENA,
    database: process.env.DB_NOMBRE,
});

const run = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS alertas_tempranas (
                id             SERIAL PRIMARY KEY,
                estudiante_id  INTEGER REFERENCES estudiantes(id) ON DELETE CASCADE,
                docente_id     INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
                materia        VARCHAR(150),
                tipo_riesgo    VARCHAR(100),
                observacion    TEXT,
                estado         VARCHAR(50) DEFAULT 'Pendiente',
                fecha_reporte  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Tabla "alertas_tempranas" lista.');

        await pool.query(`
            CREATE TABLE IF NOT EXISTS historial_intervenciones (
                id             SERIAL PRIMARY KEY,
                estudiante_id  INTEGER REFERENCES estudiantes(id) ON DELETE CASCADE,
                usuario_id     INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
                accion         VARCHAR(255) NOT NULL,
                descripcion    TEXT,
                fecha          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Tabla "historial_intervenciones" lista.');
    } catch (e) { console.error(e); } finally { pool.end(); }
};
run();
