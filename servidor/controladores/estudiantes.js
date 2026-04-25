// =============================================
// estudiantes.js — Controlador de la capa de Negocio
// Lógica para registrar masivamente vía Excel y gestionar el listado
// =============================================

const estudianteModelo = require('../modelos/estudiante');
const xlsx = require('xlsx');

// Descarga un Excel de ejemplo con las columnas obligatorias solicitadas
const descargarPlantilla = (req, res) => {
    try {
        const infoEjemplo = [
            {
                'Cédula': '1700000000',
                'Nombres': 'Juan Pérez',
                'Apellidos': 'García López',
                'Teléfono': '0987654321',
                'Correo Institucional': 'juan.perez@istpet.edu.ec'
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
        res.status(500).json({ exito: false, mensaje: 'No se pudo generar el archivo de plantilla' });
    }
};

// Carga desde Excel procesando solo los 5 campos requeridos
const cargarDesdeExcel = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ exito: false, mensaje: 'Debe subir un documento válido (.xlsx)' });
        }

        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const filas = xlsx.utils.sheet_to_json(sheet);

        if (!filas || filas.length === 0) {
            return res.status(400).json({ exito: false, mensaje: 'El archivo está vacío' });
        }

        const estudiantesValidos = [];

        for (const fila of filas) {
            // Normalizar claves a minúsculas para lectura flexible (sin importar si el Excel usa mayúsculas o minúsculas)
            const filaLower = {};
            for (const key of Object.keys(fila)) {
                filaLower[key.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '')] = fila[key];
            }

            const cedula    = filaLower['cedula'] || filaLower['id'];
            const nombres   = filaLower['nombres'] || filaLower['nombre'];
            const apellidos = filaLower['apellidos'] || filaLower['apellido'];
            const telefono  = filaLower['telefono'] || filaLower['celular'] || filaLower['phone'];
            const correo    = filaLower['correo institucional'] || filaLower['correo'] || filaLower['email'];

            if (cedula && nombres && apellidos) {
                estudiantesValidos.push({
                    cedula: String(cedula).trim(),
                    nombres: String(nombres).trim(),
                    apellidos: String(apellidos).trim(),
                    telefono: telefono ? String(telefono).trim() : '',
                    correo: correo ? String(correo).trim().toLowerCase() : ''
                });
            }
        }

        if (estudiantesValidos.length === 0) {
            return res.status(400).json({ exito: false, mensaje: 'No se encontraron datos válidos en el archivo' });
        }

        const resultados = await estudianteModelo.upsertMasivo(estudiantesValidos);

        res.json({
            exito: true,
            contador: estudiantesValidos.length,
            mensaje: `Procesados: ${estudiantesValidos.length}. Nuevos: ${resultados.insertados}, Actualizados: ${resultados.actualizados}`
        });

    } catch (error) {
        console.error('Error Excel:', error);
        res.status(500).json({ exito: false, mensaje: 'Error al procesar el archivo Excel' });
    }
};

const listar = async (req, res) => {
    try {
        const busqueda = req.query.buscar || '';
        const estudiantes = await estudianteModelo.obtenerTodos(busqueda);
        res.json({ exito: true, datos: estudiantes });
    } catch (error) {
        res.status(500).json({ exito: false, mensaje: 'Error al obtener lista' });
    }
};

const obtenerDetalle = async (req, res) => {
    try {
        const { id } = req.params;
        const estudiante = await estudianteModelo.obtenerPorId(id);
        if (!estudiante) return res.status(404).json({ exito: false, mensaje: 'No encontrado' });
        res.json({ exito: true, datos: estudiante });
    } catch (error) {
        res.status(500).json({ exito: false, mensaje: 'Error de servidor' });
    }
};

module.exports = {
    cargarDesdeExcel,
    descargarPlantilla,
    listar,
    obtenerDetalle
};
