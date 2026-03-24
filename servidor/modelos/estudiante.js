// =============================================
// estudiante.js — Modelo de la capa de Datos
// Consultas SQL para la gestión de estudiantes
// =============================================

const pool = require('../config/baseDatos');

// Crear un nuevo estudiante en la BD
const crear = async (datos) => {
    const { cedula, nombre, carrera, periodo, correo, telefono } = datos;
    const resultado = await pool.query(
        `INSERT INTO estudiantes (cedula, nombre, carrera, periodo, correo, telefono)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [cedula, nombre, carrera, periodo, correo, telefono]
    );
    return resultado.rows[0];
};

// Obtener todos los estudiantes (con búsqueda opcional)
const obtenerTodos = async (busqueda = '') => {
    let consulta = 'SELECT * FROM estudiantes';
    let parametros = [];

    // Si hay texto de búsqueda, filtra por cédula o nombre
    if (busqueda.trim()) {
        consulta += ' WHERE cedula ILIKE $1 OR nombre ILIKE $1';
        parametros = [`%${busqueda}%`];
    }

    consulta += ' ORDER BY nombre ASC';
    const resultado = await pool.query(consulta, parametros);
    return resultado.rows;
};

// Obtener un estudiante por su ID
const obtenerPorId = async (id) => {
    const resultado = await pool.query(
        'SELECT * FROM estudiantes WHERE id = $1',
        [id]
    );
    return resultado.rows[0];
};

// Vincular un formato a un estudiante
const vincularFormato = async (estudianteId, formatoId, observacion) => {
    const resultado = await pool.query(
        `INSERT INTO estudiante_formatos (estudiante_id, formato_id, observacion)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [estudianteId, formatoId, observacion || '']
    );
    return resultado.rows[0];
};

// Obtener los formatos vinculados a un estudiante (con nombre del formato)
const obtenerFormatos = async (estudianteId) => {
    const resultado = await pool.query(
        `SELECT ef.id AS asignacion_id, ef.observacion, ef.asignado_en,
                f.id AS formato_id, f.nombre, f.modulo, f.archivo_ruta
         FROM estudiante_formatos ef
         JOIN formatos f ON ef.formato_id = f.id
         WHERE ef.estudiante_id = $1
         ORDER BY ef.asignado_en DESC`,
        [estudianteId]
    );
    return resultado.rows;
};

// Desvincular un formato de un estudiante
const desvincularFormato = async (asignacionId) => {
    const resultado = await pool.query(
        'DELETE FROM estudiante_formatos WHERE id = $1 RETURNING *',
        [asignacionId]
    );
    return resultado.rows[0];
};

// Contar total de estudiantes registrados
const contar = async () => {
    const resultado = await pool.query('SELECT COUNT(*) FROM estudiantes');
    return parseInt(resultado.rows[0].count);
};

module.exports = {
    crear,
    obtenerTodos,
    obtenerPorId,
    vincularFormato,
    obtenerFormatos,
    desvincularFormato,
    contar
};
