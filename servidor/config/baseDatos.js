const { Pool } = require('pg');
require('dotenv').config();

// Configuración robusta para Neon.tech y Vercel
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Requerido para conexiones seguras en la nube
    },
    max: 10, // Máximo de conexiones
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Probar conexión de inmediato
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('❌ ERROR CRÍTICO DE BD:', err.message);
    } else {
        console.log('✅ Base de Datos conectada y respondiendo.');
    }
});

module.exports = pool;
