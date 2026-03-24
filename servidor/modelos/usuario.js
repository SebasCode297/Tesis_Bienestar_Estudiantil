// =============================================
// usuario.js — Modelo de la capa de Datos
// Contiene las consultas SQL relacionadas con la
// tabla 'usuarios'. Solo hace operaciones de BD,
// sin lógica de negocio.
// =============================================

// Importa la conexión a la base de datos
const pool = require('../config/baseDatos');

// =============================================
// buscarPorCorreo(correo)
// Busca un usuario en la BD por su correo electrónico
// Retorna el registro completo o null si no existe
// =============================================
const buscarPorCorreo = async (correo) => {
    // Consulta SQL con parámetro para evitar inyección SQL
    const resultado = await pool.query(
        'SELECT * FROM usuarios WHERE correo = $1 AND activo = TRUE',
        [correo]
    );
    // .rows[0] retorna el primer resultado o undefined si no hay
    return resultado.rows[0] || null;
};

// Exporta las funciones del modelo para usarlas en los controladores
module.exports = {
    buscarPorCorreo,
};
