// =============================================
// baseDatos.js — Configuración del pool de conexiones
// Optimizado para entornos serverless (Vercel + Neon)
// =============================================

require('dotenv').config();
const { Pool } = require('pg');

// Configuración especial para Neon en Vercel serverless:
// - max: 1 conexión por instancia (Vercel es serverless, no un servidor tradicional)
// - idleTimeoutMillis: cierra conexiones inactivas rápidamente
// - connectionTimeoutMillis: no espera más de 10s para conectar
// - ssl: Neon SIEMPRE requiere SSL con certificado verificado
const pool = new Pool(
    process.env.DATABASE_URL
        ? {
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false },
            max: 1,
            idleTimeoutMillis: 10000,
            connectionTimeoutMillis: 10000,
          }
        : {
            host:     process.env.DB_HOST,
            port:     process.env.DB_PUERTO,
            user:     process.env.DB_USUARIO,
            password: process.env.DB_CONTRASENA,
            database: process.env.DB_NOMBRE,
            max: 5,
          }
);

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
