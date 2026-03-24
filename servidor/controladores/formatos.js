// =============================================
// formatos.js — Controlador de la capa de Negocio
// Lógica para listar, subir y descargar formatos
// =============================================

const formatoModelo = require('../modelos/formato');
const path = require('path');
const fs = require('fs');

// Lista todos los formatos y los agrupa por módulo
const listarFormatos = async (req, res) => {
    try {
        const formatos = await formatoModelo.obtenerTodos();
        
        // Agrupamos en dos listas para facilitar el trabajo del frontend
        const respuesta = {
            beca: formatos.filter(f => f.modulo === 'beca'),
            seguimiento: formatos.filter(f => f.modulo === 'seguimiento')
        };
        
        res.json({ exito: true, datos: respuesta });
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
            // Si el ID no existe en BD, eliminamos el archivo subido para no dejar basura
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
        
        // Construye la ruta absoluta al archivo
        const rutaAbsoluta = path.join(__dirname, '..', 'almacenamiento', formato.archivo_ruta);
        
        // Envía el archivo al navegador forzando la descarga con su nombre original
        res.download(rutaAbsoluta, formato.archivo_nombre);
    } catch (error) {
        console.error('Error al descargar documento:', error);
        res.status(500).send('Error interno del servidor');
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

        // Construye la ruta absoluta al archivo
        const rutaAbsoluta = path.join(__dirname, '..', 'almacenamiento', formato.archivo_ruta);

        // Envía el archivo con Content-Disposition inline para que el navegador lo abra
        res.setHeader('Content-Disposition', `inline; filename="${formato.archivo_nombre}"`);
        res.sendFile(rutaAbsoluta);
    } catch (error) {
        console.error('Error al visualizar documento:', error);
        res.status(500).send('Error interno del servidor');
    }
};

module.exports = {
    listarFormatos,
    subirDocumento,
    descargarDocumento,
    verDocumento
};
