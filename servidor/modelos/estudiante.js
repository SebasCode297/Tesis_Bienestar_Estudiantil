// =============================================
// estudiante.js — Modelo de la capa de Datos
// Consultas SQL para la gestión de estudiantes
// =============================================

const pool = require('../config/baseDatos'); // Conexión a la base de datos PostgreSQL

// Función para insertar o actualizar múltiples estudiantes (Carga Masiva desde Excel)
const upsertMasivo = async (estudiantes) => {
    const cliente = await pool.connect(); // Cliente dedicado para la transacción
    let insertados = 0;
    let actualizados = 0;

    try {
        await cliente.query('BEGIN'); // Inicia la transacción

        for (const e of estudiantes) {
            // Verifica si el estudiante ya existe por su cédula
            const comprobacion = await cliente.query(
                'SELECT id FROM estudiantes WHERE cedula = $1',
                [e.cedula]
            );
            const yaExistia = comprobacion.rows.length > 0;

            // Inserta o actualiza — incluye contrasena por defecto para cumplir restricción NOT NULL
            await cliente.query(`
                INSERT INTO estudiantes (cedula, nombres, apellidos, correo_institucional, telefono, contrasena)
                VALUES ($1, $2, $3, $4, $5, $6)
                ON CONFLICT (cedula) DO UPDATE SET 
                  nombres = EXCLUDED.nombres,
                  apellidos = EXCLUDED.apellidos,
                  correo_institucional = EXCLUDED.correo_institucional,
                  telefono = EXCLUDED.telefono
            `, [e.cedula, e.nombres, e.apellidos, e.correo || '', e.telefono || '', e.cedula]);

            if (yaExistia) actualizados++;
            else insertados++;
        }

        await cliente.query('COMMIT'); // Guarda todos los cambios
        return { insertados, actualizados };
    } catch (error) {
        await cliente.query('ROLLBACK'); // Deshace si algo falla
        throw error;
    } finally {
        cliente.release(); // Libera el cliente de vuelta al pool
    }
};

// Función para obtener la lista de estudiantes con búsqueda opcional
const obtenerTodos = async (busqueda = '') => {
    let consulta = 'SELECT * FROM estudiantes WHERE 1=1';
    let parametros = [];

    if (busqueda.trim()) {
        consulta += ` AND (nombres ILIKE $1 OR apellidos ILIKE $1 OR cedula ILIKE $1)`;
        parametros.push(`%${busqueda}%`);
    }

    consulta += ' ORDER BY apellidos ASC, nombres ASC';
    const resultado = await pool.query(consulta, parametros);
    return resultado.rows;
};

// Función para obtener un solo estudiante por ID
const obtenerPorId = async (id) => {
    const resultado = await pool.query(
        'SELECT * FROM estudiantes WHERE id = $1',
        [id]
    );
    return resultado.rows[0];
};

// Función para contar el total de estudiantes
const contar = async () => {
    const resultado = await pool.query('SELECT COUNT(*) FROM estudiantes');
    return parseInt(resultado.rows[0].count);
};

module.exports = {
    upsertMasivo,
    obtenerTodos,
    obtenerPorId,
    contar
};
