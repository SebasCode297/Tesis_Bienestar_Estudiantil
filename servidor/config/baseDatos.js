// =============================================
// baseDatos.js — Configuración del pool de conexiones
// a la base de datos PostgreSQL usando la librería 'pg'
// =============================================

require('dotenv').config();
const { Pool } = require('pg');

// Configuración del Pool:prioriza DATABASE_URL (para Neon/Vercel)
// Si no existe, usa las variables individuales (para desarrollo local)
const poolConfig = process.env.DATABASE_URL 
    ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
    : {
        host:     process.env.DB_HOST,
        port:     process.env.DB_PUERTO,
        user:     process.env.DB_USUARIO,
        password: process.env.DB_CONTRASENA,
        database: process.env.DB_NOMBRE,
    };

const pool = new Pool(poolConfig);

// Verifica la conexión al iniciar el servidor
pool.connect((error, cliente, liberar) => {
    if (error) {
        console.error('❌ Error al conectar a la base de datos:', error.message);
    } else {
        console.log('✅ Conexión exitosa a PostgreSQL');
        liberar();
    }
});

module.exports = pool;
