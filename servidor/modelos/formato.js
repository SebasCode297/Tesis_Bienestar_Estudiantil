// =============================================
// formato.js — Modelo de la capa de Datos
// Maneja las consultas SQL para los formatos de Bienestar
// =============================================

const pool = require('../config/baseDatos');

// Obtiene todos los formatos ordenados (incluyendo nuevos campos)
const obtenerTodos = async () => {
    const resultado = await pool.query(
        'SELECT * FROM formatos ORDER BY modulo ASC, nombre ASC'
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

// Obtiene un solo formato por su ID
const obtenerPorId = async (id) => {
    const resultado = await pool.query(
        'SELECT * FROM formatos WHERE id = $1',
        [id]
    );
    return resultado.rows[0];
};

// Registra un nuevo formato (ahora soporta descripción)
const crear = async (nombre, modulo, descripcion = '') => {
    const resultado = await pool.query(
        'INSERT INTO formatos (nombre, modulo, descripcion) VALUES ($1, $2, $3) RETURNING *',
        [nombre, modulo, descripcion]
    );
    return resultado.rows[0];
};

// Actualiza los datos de un formato (Autogestión)
const actualizar = async (id, datos) => {
    const { nombre, modulo, descripcion, activo } = datos;
    const resultado = await pool.query(
        `UPDATE formatos 
         SET nombre = $1, modulo = $2, descripcion = $3, activo = $4
         WHERE id = $5 
         RETURNING *`,
        [nombre, modulo, descripcion, activo, id]
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

// Vincula un formato a un estudiante guardando las respuestas del Wizard (Bitácora)
const vincularConRespuestas = async (asignacionId, respuestas) => {
    const resultado = await pool.query(
        `UPDATE estudiante_formatos 
         SET respuestas_json = $1, finalizado_en = CURRENT_TIMESTAMP
         WHERE id = $2
         RETURNING *`,
        [JSON.stringify(respuestas), asignacionId]
    );
    return resultado.rows[0];
};

// Guarda respuestas del asistente sin marcar como documento final generado
const guardarRespuestasParciales = async (asignacionId, respuestas) => {
    const resultado = await pool.query(
        `UPDATE estudiante_formatos 
         SET respuestas_json = $1
         WHERE id = $2
         RETURNING *`,
        [JSON.stringify(respuestas), asignacionId]
    );
    return resultado.rows[0];
};

module.exports = {
    obtenerTodos,
    guardarArchivo,
    obtenerPorId,
    crear,
    actualizar,
    eliminar,
    vincularConRespuestas,
    guardarRespuestasParciales
};
