// =============================================
// formatos.js — Controlador de la capa de Negocio
// Usa Google Drive API para conversión Word → HTML de alta fidelidad
// =============================================

const formatoModelo = require('../modelos/formato');
const googleDrive = require('../servicios/googleDrive');

// Lista todos los formatos disponibles
const listar = async (req, res) => {
    try {
        const formatos = await formatoModelo.obtenerTodos();
        res.json({ exito: true, datos: formatos });
    } catch (error) {
        console.error('Error al listar formatos:', error);
        res.status(500).json({ exito: false, mensaje: 'Error al obtener formatos' });
    }
};

// Crea un formato nuevo desde el editor (sin Word)
const crearVacio = async (req, res) => {
    try {
        const { nombre, tipo, contenido_html } = req.body;
        if (!nombre || !nombre.trim()) {
            return res.status(400).json({ exito: false, mensaje: 'El nombre es obligatorio' });
        }
        const formato = await formatoModelo.crear(nombre.trim(), tipo || 'apoyo', contenido_html || '');
        res.json({ exito: true, mensaje: `Formato "${formato.nombre}" creado`, datos: formato });
    } catch (error) {
        console.error('Error al crear formato vacío:', error);
        res.status(500).json({ exito: false, mensaje: 'Error al crear formato' });
    }
};

// Obtiene el contenido completo de un formato para editarlo
const obtenerDetalle = async (req, res) => {
    try {
        const { id } = req.params;
        const formato = await formatoModelo.obtenerPorId(id);
        if (!formato) return res.status(404).json({ exito: false, mensaje: 'Formato no encontrado' });
        res.json({ exito: true, datos: formato });
    } catch (error) {
        console.error('Error al obtener formato:', error);
        res.status(500).json({ exito: false, mensaje: 'Error al obtener formato' });
    }
};

// Sube un Word → Google Drive lo convierte → HTML de alta fidelidad (logo, tablas, imágenes)
const subirDesdeWord = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ exito: false, mensaje: 'Debe subir un archivo .docx válido' });
        }

        const { nombre, tipo } = req.body;
        if (!nombre || !nombre.trim()) {
            return res.status(400).json({ exito: false, mensaje: 'El nombre del formato es obligatorio' });
        }

        // Google Drive: sube el Word, lo convierte a Google Docs, exporta como HTML
        const { googleDocId, htmlContent } = await googleDrive.subirWordYConvertir(
            req.file.buffer,
            nombre.trim()
        );

        if (!htmlContent || htmlContent.trim() === '') {
            return res.status(400).json({ exito: false, mensaje: 'No se pudo extraer contenido del archivo Word' });
        }

        const formato = await formatoModelo.crear(
            nombre.trim(),
            tipo || 'apoyo',
            htmlContent,
            googleDocId
        );

        res.json({ exito: true, mensaje: `Formato "${formato.nombre}" cargado correctamente`, datos: formato });
    } catch (error) {
        console.error('Error al subir formato Word:', error);
        res.status(500).json({ exito: false, mensaje: 'Error al procesar el archivo Word con Google Drive' });
    }
};

// Guarda los cambios del editor
const guardarEdicion = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, tipo, contenido_html } = req.body;

        if (!contenido_html || contenido_html.trim() === '') {
            return res.status(400).json({ exito: false, mensaje: 'El contenido no puede estar vacío' });
        }

        const formato = await formatoModelo.actualizar(id, nombre, tipo, contenido_html);
        if (!formato) return res.status(404).json({ exito: false, mensaje: 'Formato no encontrado' });

        res.json({ exito: true, mensaje: 'Formato guardado correctamente', datos: formato });
    } catch (error) {
        console.error('Error al guardar formato:', error);
        res.status(500).json({ exito: false, mensaje: 'Error al guardar formato' });
    }
};

// Elimina un formato del sistema (y de Google Drive si aplica)
const eliminar = async (req, res) => {
    try {
        const { id } = req.params;
        const formato = await formatoModelo.eliminar(id);
        if (!formato) return res.status(404).json({ exito: false, mensaje: 'Formato no encontrado' });

        // Si tiene ID en Google Drive, eliminarlo también
        if (formato.google_doc_id) {
            await googleDrive.eliminarArchivo(formato.google_doc_id);
        }

        res.json({ exito: true, mensaje: `Formato "${formato.nombre}" eliminado` });
    } catch (error) {
        console.error('Error al eliminar formato:', error);
        res.status(500).json({ exito: false, mensaje: 'Error al eliminar formato' });
    }
};

module.exports = { listar, crearVacio, obtenerDetalle, subirDesdeWord, guardarEdicion, eliminar };
