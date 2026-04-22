// =============================================
// formatos.js — Rutas de gestión de formatos
// =============================================

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Controladores y middleware
const formatosControlador = require('../controladores/formatos');
const { verificarSesion } = require('../middlewares/verificarSesion');

// =============================================
// Configuración de multer
// Define dónde y cómo se guardan los archivos subidos
// =============================================
const configuracionAlmacenamiento = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', 'almacenamiento'));
    },
    filename: (req, file, cb) => {
        // Agrega un timestamp para evitar sobreescribir archivos con el mismo nombre
        const nombreUnico = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + nombreUnico + extension);
    }
});

const upload = multer({ 
    storage: configuracionAlmacenamiento,
    // Límite de 5MB por archivo
    limits: { fileSize: 5 * 1024 * 1024 }
});

// =============================================
// Endpoints API
// IMPORTANTE: el middleware verificarSesion protege todas estas rutas
// =============================================

// GET /bienestar/api/formatos - Devuelve JSON con todos los formatos
router.get('/', verificarSesion, formatosControlador.listarFormatos);

// POST /bienestar/api/formatos/:id/subir - Sube un archivo a un formato específico
// 'documento' es el nombre del campo type="file" en el frontend
router.post('/:id/subir', verificarSesion, upload.single('documento'), formatosControlador.subirDocumento);

// GET /bienestar/api/formatos/:id/descargar - Descarga el archivo subido
router.get('/:id/descargar', verificarSesion, formatosControlador.descargarDocumento);

// GET /bienestar/api/formatos/:id/ver - Abre el archivo en el navegador (inline)
router.get('/:id/ver', verificarSesion, formatosControlador.verDocumento);

// POST /bienestar/api/formatos/nuevo - Crea un nuevo registro de formato
router.post('/nuevo', verificarSesion, formatosControlador.crearFormato);

// GET /bienestar/api/formatos/:id/campos - Obtiene los campos manuales definidos para el wizard
router.get('/:id/campos', verificarSesion, formatosControlador.obtenerCampos);

// POST /bienestar/api/formatos/generar - Procesa los datos del wizard y genera el .docx
router.post('/generar', verificarSesion, formatosControlador.generarDocumento);

// POST /bienestar/api/formatos/guardar-wizard - Guarda respuestas sin generar archivo
router.post('/guardar-wizard', verificarSesion, formatosControlador.guardarWizard);

module.exports = router;
