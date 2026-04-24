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
                INSERT INTO estudiantes (cedula, nombres, apellidos, correo, carrera, semestre, contrasena)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                ON CONFLICT (cedula) DO UPDATE SET 
                  nombres = EXCLUDED.nombres,
                  apellidos = EXCLUDED.apellidos,
                  correo = EXCLUDED.correo,
                  carrera = EXCLUDED.carrera,
                  semestre = EXCLUDED.semestre
            `, [e.cedula, e.nombres, e.apellidos, e.correo, e.carrera, e.semestre, contrasenaHash]); // Inserta o actualiza datos si hay conflicto de cédula

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
const obtenerTodos = async (busqueda = '', carrera = '', semestre = '') => { // Define función con parámetros de filtro
    let consulta = 'SELECT * FROM estudiantes WHERE 1=1'; // Inicia la cadena de consulta SQL base
    let parametros = []; // Array para almacenar los valores de los parámetros
    let contador = 1; // Contador para los marcadores de posición ($1, $2, ...)

    if (carrera && carrera !== '') { // Verifica si se proporcionó filtro de carrera
        consulta += ` AND carrera = $${contador}`; // Añade condición de carrera a la consulta
        parametros.push(carrera); // Guarda el valor de la carrera en los parámetros
        contador++; // Aumenta el contador para el siguiente parámetro
    } // Fin del filtro carrera

    if (semestre && semestre !== '') { // Verifica si se proporcionó filtro de semestre
        consulta += ` AND semestre = $${contador}`; // Añade condición de semestre a la consulta
        parametros.push(semestre); // Guarda el valor del semestre en los parámetros
        contador++; // Aumenta el contador
    } // Fin del filtro semestre

    if (busqueda.trim()) { // Verifica si hay texto en la búsqueda de nombre o cédula
        consulta += ` AND (nombres ILIKE $${contador} OR apellidos ILIKE $${contador})`; // Añade búsqueda por coincidencia parcial
        parametros.push(`%${busqueda}%`); // Guarda el patrón de búsqueda con comodines
        contador++; // Aumenta el contador
    } // Fin de búsqueda por texto

    consulta += ' ORDER BY apellidos ASC, nombres ASC'; // Ordena alfabéticamente por apellidos y nombres
    const resultado = await pool.query(consulta, parametros); // Ejecuta la consulta SQL parametrizada
    return resultado.rows; // Retorna todas las filas obtenidas
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
