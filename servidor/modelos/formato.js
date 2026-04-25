// =============================================
// formato.js — Modelo de la capa de Datos
// Consultas SQL para la gestión de formatos
// =============================================

const pool = require('../config/baseDatos');

// Obtiene todos los formatos ordenados por tipo y nombre
const obtenerTodos = async () => {
    const resultado = await pool.query(
        'SELECT id, nombre, tipo, creado_en, actualizado_en FROM formatos ORDER BY tipo ASC, nombre ASC'
    );
    return resultado.rows;
};

// Obtiene un formato completo (incluyendo HTML) por su ID
const obtenerPorId = async (id) => {
    const resultado = await pool.query(
        'SELECT * FROM formatos WHERE id = $1',
        [id]
    );
    return resultado.rows[0];
};

// Crea un nuevo formato con su contenido HTML convertido desde Word
const crear = async (nombre, tipo, contenidoHtml) => {
    const resultado = await pool.query(
        'INSERT INTO formatos (nombre, tipo, contenido_html) VALUES ($1, $2, $3) RETURNING *',
        [nombre, tipo, contenidoHtml]
    );
    return resultado.rows[0];
};

// Actualiza el contenido HTML de un formato existente (edición desde el editor)
const actualizar = async (id, nombre, tipo, contenidoHtml) => {
    const resultado = await pool.query(
        `UPDATE formatos 
         SET nombre = $1, tipo = $2, contenido_html = $3, actualizado_en = NOW()
         WHERE id = $4 
         RETURNING *`,
        [nombre, tipo, contenidoHtml, id]
    );
    return resultado.rows[0];
};

// Elimina un formato del sistema
const eliminar = async (id) => {
    const resultado = await pool.query(
        'DELETE FROM formatos WHERE id = $1 RETURNING *',
        [id]
    );
    return resultado.rows[0];
};

module.exports = { obtenerTodos, obtenerPorId, crear, actualizar, eliminar };
