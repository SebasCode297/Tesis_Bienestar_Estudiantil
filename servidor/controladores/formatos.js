const formatoModelo = require('../modelos/formato');
const path = require('path');
const fs = require('fs');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const pool = require('../config/baseDatos');

// Lista todos los formatos y los agrupa por módulo
const listarFormatos = async (req, res) => {
    try {
        const formatos = await formatoModelo.obtenerTodos();
        
        // Agrupamos en dos listas para facilitar el trabajo del frontend (vistas fijas)
        const beca = formatos.filter(f => f.modulo && f.modulo.toLowerCase() === 'beca');
        const seguimiento = formatos.filter(f => f.modulo && f.modulo.toLowerCase() === 'seguimiento');
        
        // Otros: para no perder documentos que tengan un módulo mal escrito o diferente
        const otros = formatos.filter(f => {
            const m = (f.modulo || '').toLowerCase();
            return m !== 'beca' && m !== 'seguimiento';
        });

        res.json({ 
            exito: true, 
            datos: { beca, seguimiento, otros },
            total: formatos.length
        });
    } catch (error) {
        console.error('Error al listar formatos:', error);
        res.status(500).json({ exito: false, mensaje: 'Error al obtener formatos' });
    }
};

// Procesa la subida del documento
const subirDocumento = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Multer deja el archivo en req.file
        if (!req.file) {
            return res.status(400).json({ exito: false, mensaje: 'No se subió ningún archivo' });
        }
        
        const archivoNombre = req.file.originalname;
        const archivoRuta = req.file.filename;

        // Actualizamos en la base de datos
        const formatoActualizado = await formatoModelo.guardarArchivo(id, archivoNombre, archivoRuta);
        
        if (!formatoActualizado) {
            fs.unlinkSync(req.file.path);
            return res.status(404).json({ exito: false, mensaje: 'Formato no encontrado' });
        }
        
        res.json({ exito: true, mensaje: 'Archivo subido correctamente' });
    } catch (error) {
        console.error('Error al subir documento:', error);
        res.status(500).json({ exito: false, mensaje: 'Error interno al procesar el archivo' });
    }
};

// Descarga un documento previamente subido
const descargarDocumento = async (req, res) => {
    try {
        const { id } = req.params;
        const formato = await formatoModelo.obtenerPorId(id);
        
        if (!formato || !formato.archivo_ruta) {
            return res.status(404).send('Archivo no encontrado');
        }
        
        const rutaAbsoluta = path.join(__dirname, '..', 'almacenamiento', formato.archivo_ruta);
        
        if (!fs.existsSync(rutaAbsoluta)) {
            return res.status(404).send('El archivo físico no existe');
        }

        const extension = path.extname(formato.archivo_nombre) || '.docx';
        let nombreSanitizado = formato.nombre.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        nombreSanitizado = nombreSanitizado.replace(/[^a-zA-Z0-9]/g, "_").replace(/__+/g, "_");
        
        const nombreFinal = `${nombreSanitizado}${extension}`;

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename="${nombreFinal}"`);

        const stream = fs.createReadStream(rutaAbsoluta);
        stream.pipe(res);
    } catch (error) {
        console.error('Error al descargar documento:', error);
        res.status(500).send('Error interno');
    }
};

// Muestra el archivo directamente en el navegador (sin forzar descarga)
const verDocumento = async (req, res) => {
    try {
        const { id } = req.params;
        const formato = await formatoModelo.obtenerPorId(id);

        if (!formato || !formato.archivo_ruta) {
            return res.status(404).send('Archivo no encontrado');
        }

        const rutaAbsoluta = path.join(__dirname, '..', 'almacenamiento', formato.archivo_ruta);
        const extension = path.extname(formato.archivo_nombre);
        const nombreSistematizado = `${formato.nombre}${extension}`;

        res.setHeader('Content-Disposition', `inline; filename="${nombreSistematizado}"`);
        res.sendFile(rutaAbsoluta);
    } catch (error) {
        console.error('Error al visualizar documento:', error);
        res.status(500).send('Error interno');
    }
};

const crearFormato = async (req, res) => {
    try {
        const { nombre, modulo, descripcion } = req.body;
        if (!nombre || !modulo) {
            return res.status(400).json({ exito: false, mensaje: 'Faltan datos obligatorios (nombre y módulo)' });
        }
        // El nuevo modelo ya soporta descripción
        const nuevo = await formatoModelo.crear(nombre, modulo, descripcion || '');
        res.status(201).json({ exito: true, datos: nuevo, mensaje: 'Formato creado con éxito' });
    } catch (error) {
        console.error('Error al crear formato:', error);
        res.status(500).json({ exito: false, mensaje: 'Error al registrar el formato' });
    }
};

const actualizarFormato = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, modulo, descripcion, activo } = req.body;
        
        if (!nombre || !modulo) {
            return res.status(400).json({ exito: false, mensaje: 'Nombre y módulo son requeridos' });
        }

        const actualizado = await formatoModelo.actualizar(id, { 
            nombre, 
            modulo, 
            descripcion: descripcion || '', 
            activo: activo !== undefined ? activo : true 
        });
        
        if (!actualizado) {
            return res.status(404).json({ exito: false, mensaje: 'Formato no encontrado' });
        }

        res.json({ exito: true, datos: actualizado, mensaje: 'Formato actualizado correctamente' });
    } catch (error) {
        console.error('Error al actualizar formato:', error);
        res.status(500).json({ exito: false, mensaje: 'Error al actualizar' });
    }
};

const eliminarFormato = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Primero obtenemos datos para borrar el archivo físico si existe
        const formato = await formatoModelo.obtenerPorId(id);
        if (formato && formato.archivo_ruta) {
            const rutaAbsoluta = path.join(__dirname, '..', 'almacenamiento', formato.archivo_ruta);
            if (fs.existsSync(rutaAbsoluta)) {
                fs.unlinkSync(rutaAbsoluta);
            }
        }

        const eliminado = await formatoModelo.eliminar(id);
        
        if (!eliminado) {
            return res.status(404).json({ exito: false, mensaje: 'Formato no encontrado' });
        }

        res.json({ exito: true, mensaje: 'Formato eliminado permanentemente del sistema' });
    } catch (error) {
        console.error('Error al eliminar formato:', error);
        res.status(500).json({ exito: false, mensaje: 'Error al eliminar el formato' });
    }
};

const normalizarDefinicionWizard = (raw) => {
    if (!raw) return { modo: 'vacio', campos: [], pasos: [], tituloDocumento: 'Documento' };
    if (Array.isArray(raw)) {
        return { modo: 'legacy', campos: raw, pasos: null, tituloDocumento: 'Documento' };
    }
    if (raw.pasos && Array.isArray(raw.pasos)) {
        return {
            modo: 'pasos',
            pasos: raw.pasos,
            campos: null,
            tituloDocumento: raw.tituloDocumento || 'Documento'
        };
    }
    return { modo: 'vacio', campos: [], pasos: [], tituloDocumento: 'Documento' };
};

const obtenerCampos = async (req, res) => {
    try {
        const { id } = req.params;
        const formato = await formatoModelo.obtenerPorId(id);
        if (!formato) return res.status(404).json({ exito: false, mensaje: 'No encontrado' });
        let raw = formato.campos_json;
        if (typeof raw === 'string') {
            try { raw = JSON.parse(raw); } catch (e) { raw = null; }
        }
        const def = normalizarDefinicionWizard(raw);
        res.json({ exito: true, ...def });
    } catch (error) {
        res.status(500).json({ exito: false, mensaje: 'Error interno' });
    }
};

const guardarWizard = async (req, res) => {
    try {
        const { asignacionId, datosWizard } = req.body;
        if (!asignacionId || !datosWizard || typeof datosWizard !== 'object') {
            return res.status(400).json({ exito: false, mensaje: 'Faltan datos de la asignación o respuestas' });
        }
        await formatoModelo.guardarRespuestasParciales(asignacionId, datosWizard);
        res.json({ exito: true, mensaje: 'Respuestas guardadas' });
    } catch (error) {
        console.error('Error guardar wizard:', error);
        res.status(500).json({ exito: false, mensaje: 'Error al guardar' });
    }
};

const generarDocumento = async (req, res) => {
    try {
        const { asignacionId, datosWizard } = req.body;
        
        // 1. Obtener la asignación para saber qué formato y qué estudiante corregir
        const asignacionRes = await pool.query(
            'SELECT ef.*, f.archivo_ruta, f.nombre FROM estudiante_formatos ef JOIN formatos f ON ef.formato_id = f.id WHERE ef.id = $1',
            [asignacionId]
        );
        const asignacion = asignacionRes.rows[0];

        if (!asignacion || !asignacion.archivo_ruta) {
            return res.status(404).json({ exito: false, mensaje: 'Plantilla no encontrada para esta asignación' });
        }

        let datos = datosWizard;
        if (!datos || typeof datos !== 'object' || Object.keys(datos).length === 0) {
            let rj = asignacion.respuestas_json;
            if (typeof rj === 'string') {
                try { rj = JSON.parse(rj); } catch (e) { rj = null; }
            }
            datos = rj;
        }
        if (!datos || typeof datos !== 'object' || Object.keys(datos).length === 0) {
            return res.status(400).json({ exito: false, mensaje: 'No hay respuestas guardadas. Guarde el asistente antes de descargar.' });
        }

        const rutaPlantilla = path.join(__dirname, '..', 'almacenamiento', asignacion.archivo_ruta);
        const content = fs.readFileSync(rutaPlantilla, 'binary');
        const zip = new PizZip(content);
        
        // Usamos [[ ]] para evitar conflictos con etiquetas corruptas {{ }} que puedan existir
        const doc = new Docxtemplater(zip, { 
            paragraphLoop: true, 
            linebreaks: true,
            delimiters: { start: '[[', end: ']]' } 
        });

        // 2. Merge de datos (Llenado del Word)
        doc.render(datos);

        const buf = doc.getZip().generate({ type: 'nodebuffer', compression: 'DEFLATE' });
        
        // 3. Guardar las respuestas en la Bitácora (Persistencia)
        await formatoModelo.vincularConRespuestas(asignacionId, datos);

        const nombreSalida = `GENERADO_${asignacion.nombre.replace(/\s+/g, '_')}.docx`;
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename="${nombreSalida}"`);
        res.send(buf);
    } catch (error) {
        console.error('Error al generar documento:', error);
        res.status(500).json({ 
            exito: false, 
            mensaje: 'Error al procesar Word o guardar bitácora',
            error: error.message,
            stack: error.stack,
            properties: error.properties // Detalles de Docxtemplater
        });
    }
};

module.exports = {
    listarFormatos,
    subirDocumento,
    descargarDocumento,
    verDocumento,
    crearFormato,
    actualizarFormato,
    eliminarFormato,
    obtenerCampos,
    guardarWizard,
    generarDocumento
};
