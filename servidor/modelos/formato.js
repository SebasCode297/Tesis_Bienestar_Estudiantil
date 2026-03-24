// =============================================
// formato.js — Modelo de la capa de Datos
// Maneja las consultas SQL para los formatos de Bienestar
// =============================================

const pool = require('../config/baseDatos');

// Obtiene todos los formatos ordenados
const obtenerTodos = async () => {
    const resultado = await pool.query(
        'SELECT * FROM formatos ORDER BY modulo ASC, id ASC'
    );
    return resultado.rows;
};

// Actualiza el registro de un formato con el archivo subido
const guardarArchivo = async (idFormato, archivoNombre, archivoRuta) => {
    const resultado = await pool.query(
        `UPDATE formatos 
         SET archivo_nombre = $1, archivo_ruta = $2, subido_en = CURRENT_TIMESTAMP 
         WHERE id = $3 
         RETURNING *`,
        [archivoNombre, archivoRuta, idFormato]
    );
    return resultado.rows[0];
};

// Obtiene un solo formato por su ID (para descarga)
const obtenerPorId = async (id) => {
    const resultado = await pool.query(
        'SELECT * FROM formatos WHERE id = $1',
        [id]
    );
    return resultado.rows[0];
};

module.exports = {
    obtenerTodos,
    guardarArchivo,
    obtenerPorId
};
