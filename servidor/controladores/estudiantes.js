// =============================================
// estudiantes.js — Controlador de la capa de Negocio
// Estructura real de la tabla en Neon:
// id, cedula, nombres, apellidos, correo_institucional, telefono, creado_en
// =============================================

const estudianteModelo = require('../modelos/estudiante');
const pool = require('../config/baseDatos');
const xlsx = require('xlsx');

// Descarga un Excel de ejemplo con las columnas exactas de la tabla
const descargarPlantilla = (req, res) => {
    try {
        const infoEjemplo = [
            {
                'Cedula':                '1700000000',
                'Nombres':               'Juan Andres',
                'Apellidos':             'Garcia Lopez',
                'Correo Institucional':  'juan.garcia@istpet.edu.ec',
                'Telefono':              '0987654321'
            }
        ];

        const hoja = xlsx.utils.json_to_sheet(infoEjemplo);
        const libro = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(libro, hoja, 'Plantilla_Estudiantes');
        const buffer = xlsx.write(libro, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader('Content-Disposition', 'attachment; filename="Plantilla_ISTPET.xlsx"');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);
    } catch (error) {
        console.error('Error al generar plantilla:', error);
        res.status(500).json({ exito: false, mensaje: 'No se pudo generar la plantilla' });
    }
};

// Carga masiva desde Excel — usa columnas reales de la tabla
const cargarDesdeExcel = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ exito: false, mensaje: 'Debe subir un archivo .xlsx válido' });
        }

        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheet    = workbook.Sheets[workbook.SheetNames[0]];
        const filas    = xlsx.utils.sheet_to_json(sheet);

        if (!filas || filas.length === 0) {
            return res.status(400).json({ exito: false, mensaje: 'El archivo está vacío' });
        }

        const estudiantesValidos = [];

        for (const fila of filas) {
            // Normalizar claves: minúsculas, sin tildes, sin espacios extras
            const norm = {};
            for (const key of Object.keys(fila)) {
                const k = key.toLowerCase().trim()
                    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                norm[k] = fila[key];
            }

            // Mapear columnas del Excel a campos del modelo
            const cedula   = norm['cedula']   || norm['id']   || norm['ci'];
            const nombres  = norm['nombres']  || norm['nombre'];
            const apellidos= norm['apellidos']|| norm['apellido'];
            const correo   = norm['correo institucional'] || norm['correo'] || norm['email'] || '';
            const telefono = norm['telefono'] || norm['celular'] || norm['phone'] || '';

            if (cedula && nombres && apellidos) {
                estudiantesValidos.push({
                    cedula:    String(cedula).trim(),
                    nombres:   String(nombres).trim(),
                    apellidos: String(apellidos).trim(),
                    correo:    String(correo).trim().toLowerCase(),
                    telefono:  String(telefono).trim()
                });
            }
        }

        if (estudiantesValidos.length === 0) {
            return res.status(400).json({ exito: false, mensaje: 'No se encontraron filas válidas. Verifica que el Excel tenga las columnas: Cedula, Nombres, Apellidos' });
        }

        const resultados = await estudianteModelo.upsertMasivo(estudiantesValidos);

        res.json({
            exito: true,
            mensaje: `Carga completada. Nuevos: ${resultados.insertados}, Actualizados: ${resultados.actualizados}`,
            contador: estudiantesValidos.length
        });

    } catch (error) {
        console.error('Error en carga Excel:', error.message);
        res.status(500).json({ exito: false, mensaje: 'Error al procesar el archivo: ' + error.message });
    }
};

// Lista todos los estudiantes con búsqueda opcional
const listar = async (req, res) => {
    try {
        const busqueda    = req.query.buscar || '';
        const estudiantes = await estudianteModelo.obtenerTodos(busqueda);
        res.json({ exito: true, datos: estudiantes });
    } catch (error) {
        console.error('Error al listar:', error.message);
        res.status(500).json({ exito: false, mensaje: 'Error al obtener lista de estudiantes' });
    }
};

// Buscador predictivo por cédula, nombre o apellido (para el modal de Alertas)
const buscar = async (req, res) => {
    try {
        const q = req.query.q || '';
        if (q.length < 2) return res.json({ exito: true, datos: [] });

        const resultado = await pool.query(
            `SELECT id, nombres, apellidos, cedula 
             FROM estudiantes 
             WHERE cedula ILIKE $1 OR apellidos ILIKE $1 OR nombres ILIKE $1
             LIMIT 5`,
            [`%${q}%`]
        );
        res.json({ exito: true, datos: resultado.rows });
    } catch (error) {
        console.error('Error en búsqueda:', error.message);
        res.status(500).json({ exito: false, mensaje: 'Error en búsqueda' });
    }
};

// Detalle de un estudiante por ID
const obtenerDetalle = async (req, res) => {
    try {
        const { id }       = req.params;
        const estudiante   = await estudianteModelo.obtenerPorId(id);
        if (!estudiante) return res.status(404).json({ exito: false, mensaje: 'Estudiante no encontrado' });
        res.json({ exito: true, datos: estudiante });
    } catch (error) {
        res.status(500).json({ exito: false, mensaje: 'Error de servidor' });
    }
};

module.exports = { cargarDesdeExcel, descargarPlantilla, listar, buscar, obtenerDetalle };
