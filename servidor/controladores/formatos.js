// =============================================
// formatos.js — Controlador de la capa de Negocio
// Lógica para subir, convertir, editar y listar formatos
// =============================================

const formatoModelo = require('../modelos/formato');
const mammoth = require('mammoth');

// Lista todos los formatos disponibles (sin el HTML completo para mayor velocidad)
const listar = async (req, res) => {
    try {
        const formatos = await formatoModelo.obtenerTodos();
        res.json({ exito: true, datos: formatos });
    } catch (error) {
        console.error('Error al listar formatos:', error);
        res.status(500).json({ exito: false, mensaje: 'Error al obtener formatos' });
    }
};

// Crea un formato nuevo directamente desde el editor (sin archivo Word)
const crearVacio = async (req, res) => {
    try {
        const { nombre, tipo, contenido_html } = req.body;
        if (!nombre || !nombre.trim()) {
            return res.status(400).json({ exito: false, mensaje: 'El nombre es obligatorio' });
        }
        const formato = await formatoModelo.crear(nombre.trim(), tipo || 'apoyo', contenido_html || '');
        res.json({ exito: true, mensaje: `Formato "${formato.nombre}" creado correctamente`, datos: formato });
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

// Sube un archivo Word (.docx), lo convierte a HTML y lo guarda en la base de datos
const subirDesdeWord = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ exito: false, mensaje: 'Debe subir un archivo .docx válido' });
        }

        const { nombre, tipo } = req.body;
        if (!nombre || !nombre.trim()) {
            return res.status(400).json({ exito: false, mensaje: 'El nombre del formato es obligatorio' });
        }

        // Convierte el Word a HTML preservando tablas, texto e imágenes básicas
        const resultado = await mammoth.convertToHtml({ buffer: req.file.buffer });
        const htmlConvertido = resultado.value;

        if (!htmlConvertido || htmlConvertido.trim() === '') {
            return res.status(400).json({ exito: false, mensaje: 'No se pudo extraer contenido del archivo Word' });
        }

        const formato = await formatoModelo.crear(
            nombre.trim(),
            tipo || 'apoyo',
            htmlConvertido
        );

        res.json({
            exito: true,
            mensaje: `Formato "${formato.nombre}" cargado correctamente`,
            datos: formato
        });
    } catch (error) {
        console.error('Error al subir formato Word:', error);
        res.status(500).json({ exito: false, mensaje: 'Error al procesar el archivo Word' });
    }
};

// Guarda los cambios del editor (HTML editado manualmente en el navegador)
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

// Elimina un formato del sistema
const eliminar = async (req, res) => {
    try {
        const { id } = req.params;
        const formato = await formatoModelo.eliminar(id);
        if (!formato) return res.status(404).json({ exito: false, mensaje: 'Formato no encontrado' });
        res.json({ exito: true, mensaje: `Formato "${formato.nombre}" eliminado` });
    } catch (error) {
        console.error('Error al eliminar formato:', error);
        res.status(500).json({ exito: false, mensaje: 'Error al eliminar formato' });
    }
};

module.exports = { listar, crearVacio, obtenerDetalle, subirDesdeWord, guardarEdicion, eliminar };
