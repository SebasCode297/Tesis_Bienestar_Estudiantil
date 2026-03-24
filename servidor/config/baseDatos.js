// =============================================
// baseDatos.js — Configuración del pool de conexiones
// a la base de datos PostgreSQL usando la librería 'pg'
// Se exporta el pool para usarse en los modelos
// =============================================

// Carga las variables de entorno desde el archivo .env
require('dotenv').config();

// Importa el módulo Pool de la librería pg
const { Pool } = require('pg');

// Crea el pool de conexiones con los parámetros del archivo .env
const pool = new Pool({
    host:     process.env.DB_HOST,       // Servidor de la base de datos
    port:     process.env.DB_PUERTO,     // Puerto (por defecto 5432)
    user:     process.env.DB_USUARIO,    // Usuario de PostgreSQL
    password: process.env.DB_CONTRASENA, // Contraseña del usuario
    database: process.env.DB_NOMBRE,     // Nombre de la base de datos
});

// Verifica la conexión al iniciar el servidor
pool.connect((error, cliente, liberar) => {
    if (error) {
        console.error('❌ Error al conectar a la base de datos:', error.message);
    } else {
        console.log('✅ Conexión exitosa a PostgreSQL');
        liberar(); // Libera el cliente de vuelta al pool
    }
});

// Exporta el pool para usarlo en los modelos
module.exports = pool;
