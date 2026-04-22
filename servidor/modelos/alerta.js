// =============================================
// alerta.js — Modelo de la capa de Datos
// Consultas SQL para la gestión de alertas tempranas
// =============================================

const pool = require('../config/baseDatos'); // Importa la conexión a la base de datos PostgreSQL

// Crear una nueva alerta temprana en el sistema
const crear = async (datos) => { // Define la función asíncrona para insertar registros
    const { estudiante_id, docente_id, materia, tipo_riesgo, observacion } = datos; // Desestructura los datos recibidos
    const resultado = await pool.query( // Ejecuta la consulta de inserción en la tabla de alertas
        `INSERT INTO alertas_tempranas 
         (estudiante_id, docente_id, materia, tipo_riesgo, observacion, estado)
         VALUES ($1, $2, $3, $4, $5, 'Pendiente')
         RETURNING *`, // SQL que inserta los valores y retorna el registro creado
        [estudiante_id, docente_id, materia, tipo_riesgo, observacion] // Paso de parámetros seguros para evitar inyección SQL
    ); // Fin de la ejecución de la consulta
    return resultado.rows[0]; // Retorna el primer registro insertado
}; // Cierre de la función crear

// Obtener una alerta por su ID (útil para la gestión de Bienestar)
const obtenerPorId = async (id) => { // Define función para buscar una alerta específica
    const resultado = await pool.query( // Ejecuta consulta con JOINs para obtener información completa
        `SELECT a.*, e.nombres, e.apellidos, e.cedula, e.correo as estudiante_correo,
                u.correo as docente_correo
         FROM alertas_tempranas a
         JOIN estudiantes e ON a.estudiante_id = e.id
         LEFT JOIN usuarios u ON a.docente_id = u.id
         WHERE a.id = $1`, // Consulta SQL que une tablas de alertas, estudiantes y usuarios
        [id] // Parámetro ID para filtrar la búsqueda
    ); // Fin de la ejecución
    return resultado.rows[0]; // Retorna el objeto de la alerta encontrada
}; // Cierre de la función obtenerPorId

// Actualizar el estado de una alerta (procedimiento usado por Bienestar)
const actualizarEstado = async (id, nuevoEstado) => { // Define función para cambiar el estado (Ej: Resuelto)
    const resultado = await pool.query( // Ejecuta el UPDATE en la base de datos
        `UPDATE alertas_tempranas 
         SET estado = $1 
         WHERE id = $2 
         RETURNING *`, // SQL que modifica el campo estado y devuelve el resultado
        [nuevoEstado, id] // Parámetros para el nuevo estado y el ID de la alerta
    ); // Fin de la ejecución
    return resultado.rows[0]; // Retorna el registro actualizado
}; // Cierre de la función actualizarEstado

module.exports = { // Exporta las funciones para que el controlador pueda usarlas
    crear, // Exporta función de creación
    obtenerPorId, // Exporta función de búsqueda por ID
    actualizarEstado // Exporta función de actualización de estado
}; // Fin del módulo de exportación
