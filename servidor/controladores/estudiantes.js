// =============================================
// estudiantes.js — Controlador de la capa de Negocio
// Lógica para registrar masivamente vía Excel y gestionar el listado
// =============================================

const estudianteModelo = require('../modelos/estudiante');
const xlsx = require('xlsx');

// Descarga un Excel de ejemplo con las columnas obligatorias
const descargarPlantilla = (req, res) => {
    try {
        const infoEjemplo = [
            {
                Nombres: 'Carlos Sebastian',
                Apellidos: 'Pilamunga Quiroga',
                Cédula: '1700000000',
                Carrera: 'Desarrollo de Software',
                Semestres: '3ro',
                'Correo Institucional': 'carlos.pilamunga@istpet.edu.ec'
            },
            {
                Nombres: 'María Fernanda',
                Apellidos: 'López Ruiz',
                Cédula: '1700000001',
                Carrera: 'Contabilidad',
                Semestres: '1ro',
                'Correo Institucional': 'maria.lopez@istpet.edu.ec'
            }
        ];

        const hoja = xlsx.utils.json_to_sheet(infoEjemplo);
        const libro = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(libro, hoja, 'Plantilla');

        // Convierte el libro a un buffer en memoria
        const buffer = xlsx.write(libro, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader('Content-Disposition', 'attachment; filename="Plantilla_Estudiantes.xlsx"');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);
    } catch (error) {
        console.error('Error al generar plantilla:', error);
        res.status(500).json({ exito: false, mensaje: 'No se pudo generar el archivo de plantilla' });
    }
};

// Carga masiva de estudiantes leyendo un archivo Excel o CSV desde la RAM
const cargarMasiva = async (req, res) => {
    try {
        // req.file lo inyecta multer y está en la RAM (buffer)
        if (!req.file) {
            return res.status(400).json({ exito: false, mensaje: 'Debe subir un documento válido' });
        }

        // 1. Lee el archivo y accede a la 1ra hoja
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const nombrePrimeraHoja = workbook.SheetNames[0];
        const hojaSeleccionada = workbook.Sheets[nombrePrimeraHoja];

        // 2. Convierte todo lo que encuentre en filas JSON usando la línea 1 como cabeceras / llaves
        const filas = xlsx.utils.sheet_to_json(hojaSeleccionada);

        if (!filas || filas.length === 0) {
            return res.status(400).json({ exito: false, mensaje: 'El archivo subido está vacío o sin datos' });
        }

        const estudiantesValidos = [];
        let filasErroneasAIgnorar = 0;

        // 3. Limpiar y mapear datos tolerando ligeras variaciones en los títulos que la gente acostumbra a inventar
        for (const fila of filas) {
            const nombres = fila['Nombres'] || fila['nombres'] || fila['NOMBRES'] || fila['Nombre'];
            const apellidos = fila['Apellidos'] || fila['apellidos'] || fila['APELLIDOS'] || fila['Apellido'];
            const cedula = fila['Cédula'] || fila['Cedula'] || fila['cedula'] || fila['CEDULA'];
            const correo = fila['Correo Institucional'] || fila['Correo'] || fila['correo'] || fila['CORREO'];
            const carrera = fila['Carrera'] || fila['carrera'] || fila['CARRERA'];
            const semestre = fila['Semestres'] || fila['Semestre'] || fila['semestre'] || fila['SEMESTRE'];

            // Regla de negocio: Obligatorios Nombres, Apellidos, Cédula y Carrera
            if (cedula && nombres && apellidos && carrera) {
                const nombresTrim = String(nombres).trim();
                const apellidosTrim = String(apellidos).trim();

                let correoFinal = correo ? String(correo).trim().toLowerCase() : '';

                // Autogenerar correo si está en blanco
                if (!correoFinal) {
                    // Remover acentos y tomar primer nombre y apellido
                    const pNombre = nombresTrim.split(' ')[0].toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                    const pApellido = apellidosTrim.split(' ')[0].toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                    correoFinal = `${pNombre}.${pApellido}@istpet.edu.ec`;
                }

                // Normalizar semestre (extraer solo el número central: "3ro", "3ero" -> "3")
                let semestreLimpio = '1';
                if (semestre) {
                    const match = String(semestre).match(/\d+/);
                    semestreLimpio = match ? match[0] : '1';
                }

                estudiantesValidos.push({
                    cedula: String(cedula).trim(),
                    nombres: nombresTrim,
                    apellidos: apellidosTrim,
                    correo: correoFinal,
                    carrera: String(carrera).trim(),
                    semestre: semestreLimpio
                });
            } else {
                filasErroneasAIgnorar++;
            }
        }

        if (estudiantesValidos.length === 0) {
            return res.status(400).json({ 
                exito: false, 
                mensaje: 'No se identificó a ningún estudiante válido. Valida que los títulos de tus columnas coincidan con la plantilla.' 
            });
        }

        // 4. Inserción segura con Postgres y devolvemos qué pasó
        const resultados = await estudianteModelo.upsertMasivo(estudiantesValidos);

        res.json({
            exito: true,
            mensaje: `Se detectaron ${estudiantesValidos.length} filas válidas. \nNuevos registrados: ${resultados.insertados} \nEstudiantes actualizados: ${resultados.actualizados}`,
            datos: resultados,
            ignorados: filasErroneasAIgnorar
        });

    } catch (error) {
        console.error('Error al procesar el Excel:', error);
        res.status(500).json({ exito: false, mensaje: 'Hubo un error al interpretar el formato de los datos' });
    }
};

// Lista todos los estudiantes (con búsqueda opcional via query ?buscar=)
const listar = async (req, res) => {
    try {
        const busqueda = req.query.buscar || '';
        const estudiantes = await estudianteModelo.obtenerTodos(busqueda);
        res.json({ exito: true, datos: estudiantes });
    } catch (error) {
        console.error('Error al listar estudiantes:', error);
        res.status(500).json({ exito: false, mensaje: 'Error al obtener estudiantes' });
    }
};

// Obtiene el detalle de un estudiante + sus formatos vinculados
const obtenerDetalle = async (req, res) => {
    try {
        const { id } = req.params;
        const estudiante = await estudianteModelo.obtenerPorId(id);

        if (!estudiante) {
            return res.status(404).json({ exito: false, mensaje: 'Estudiante no encontrado' });
        }

        // También traemos sus formatos vinculados
        const formatos = await estudianteModelo.obtenerFormatos(id);

        res.json({ exito: true, datos: { ...estudiante, formatos } });
    } catch (error) {
        console.error('Error al obtener detalle:', error);
        res.status(500).json({ exito: false, mensaje: 'Error interno del servidor' });
    }
};

// Vincula un formato a un estudiante
const vincularFormato = async (req, res) => {
    try {
        const { id } = req.params; // ID del estudiante
        const { formatoId, observacion } = req.body;

        if (!formatoId) {
            return res.status(400).json({ exito: false, mensaje: 'Debe seleccionar un formato' });
        }

        const asignacion = await estudianteModelo.vincularFormato(id, formatoId, observacion);
        res.json({ exito: true, datos: asignacion, mensaje: 'Formato vinculado correctamente' });
    } catch (error) {
        console.error('Error al vincular formato:', error);
        res.status(500).json({ exito: false, mensaje: 'Error al vincular formato' });
    }
};

// Desvincula un formato de un estudiante
const desvincularFormato = async (req, res) => {
    try {
        const { asignacionId } = req.params;
        const eliminado = await estudianteModelo.desvincularFormato(asignacionId);

        if (!eliminado) {
            return res.status(404).json({ exito: false, mensaje: 'Asignación no encontrada' });
        }

        res.json({ exito: true, mensaje: 'Formato desvinculado' });
    } catch (error) {
        console.error('Error al desvincular formato:', error);
        res.status(500).json({ exito: false, mensaje: 'Error interno del servidor' });
    }
};

module.exports = {
    cargarMasiva,
    descargarPlantilla,
    listar,
    obtenerDetalle,
    vincularFormato,
    desvincularFormato
};
