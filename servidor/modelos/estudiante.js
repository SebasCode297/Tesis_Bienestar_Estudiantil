// =============================================
// estudiante.js — Modelo de la capa de Datos
// Consultas SQL para la gestión de estudiantes
// =============================================

const pool = require('../config/baseDatos'); // Importación de la conexión a la base de datos PostgreSQL
const bcrypt = require('bcryptjs'); // Importación de la librería para encriptar contraseñas

// Función para insertar o actualizar múltiples estudiantes (Carga Masiva)
const upsertMasivo = async (estudiantes) => { // Define función asíncrona de carga masiva
    const cliente = await pool.connect(); // Obtiene un cliente dedicado de la piscina de conexiones
    let insertados = 0; // Contador para rastrear registros nuevos insertados
    let actualizados = 0; // Contador para rastrear registros existentes actualizados

    try { // Bloque try para manejar errores durante la transacción
        await cliente.query('BEGIN'); // Inicia el bloque de transacción SQL

        for (const e of estudiantes) { // Itera sobre cada objeto estudiante recibido del Excel
            const comprobacion = await cliente.query('SELECT id FROM estudiantes WHERE cedula = $1', [e.cedula]); // Busca si la cédula ya existe
            const yaExistia = comprobacion.rows.length > 0; // Determina si el registro es una actualización

            const contrasenaHash = await bcrypt.hash(e.cedula, 8); // Genera un hash de la cédula como contraseña inicial

            await cliente.query(`
                INSERT INTO estudiantes (cedula, nombres, apellidos, correo_institucional, telefono, contrasena)
                VALUES ($1, $2, $3, $4, $5, $6)
                ON CONFLICT (cedula) DO UPDATE SET 
                  nombres = EXCLUDED.nombres,
                  apellidos = EXCLUDED.apellidos,
                  correo_institucional = EXCLUDED.correo_institucional,
                  telefono = EXCLUDED.telefono
            `, [e.cedula, e.nombres, e.apellidos, e.correo, e.telefono, contrasenaHash]); // Inserta o actualiza datos si hay conflicto de cédula

            if (yaExistia) actualizados++; // Incrementa contador de actualizaciones si ya existía
            else insertados++; // Incrementa contador de nuevos si no existía
        } // Fin del bucle for
        
        await cliente.query('COMMIT'); // Confirma y guarda todos los cambios en la base de datos
        return { insertados, actualizados }; // Retorna los resultados del proceso
    } catch (error) { // Captura errores durante el proceso
        await cliente.query('ROLLBACK'); // Deshace todos los cambios si hubo algún error
        throw error; // Lanza el error para que sea manejado por el controlador
    } finally { // Bloque que se ejecuta siempre al final
        cliente.release(); // Libera el cliente de vuelta a la piscina de conexiones
    } // Fin del bloque finally
}; // Cierre de la función upsertMasivo

// Función para obtener la lista de estudiantes con filtros opcionales
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
}; // Cierre de la función obtenerTodos

// Función para obtener los detalles de un solo estudiante por su ID único
const obtenerPorId = async (id) => { // Define función de búsqueda individual
    const resultado = await pool.query( // Ejecuta la consulta directa por ID
        'SELECT * FROM estudiantes WHERE id = $1', // SQL simple para filtrar por id
        [id] // Pasa el ID como parámetro seguro
    ); // Fin de la ejecución
    return resultado.rows[0]; // Retorna el primer y único registro encontrado
}; // Cierre de la función obtenerPorId

// Función para contar la cantidad total de estudiantes en el sistema
const contar = async () => { // Define función de conteo estadístico
    const resultado = await pool.query('SELECT COUNT(*) FROM estudiantes'); // Ejecuta cuenta en la tabla estudiantes
    return parseInt(resultado.rows[0].count); // Retorna el número entero obtenido
}; // Cierre de la función contar

module.exports = { // Exporta el objeto con todas las funciones del modelo
    upsertMasivo, // Exporta carga masiva
    obtenerTodos, // Exporta listado filtrado
    obtenerPorId, // Exporta búsqueda individual
    contar // Exporta conteo total
}; // Fin del módulo de exportación de estudiantes
