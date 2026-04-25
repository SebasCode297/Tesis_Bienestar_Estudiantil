const express = require('express');
const router = express.Router();
const estudiantesControlador = require('../controladores/estudiantes');
const { verificarSesionAPI } = require('../middlewares/verificarSesion');
const multer = require('multer');

const cargador = multer({ storage: multer.memoryStorage() });

// Todas las rutas de la API de estudiantes usan verificarSesionAPI
// para devolver JSON 401 en lugar de redirigir cuando la sesión no existe
router.get('/', verificarSesionAPI, estudiantesControlador.listar);
router.get('/descargar-plantilla', verificarSesionAPI, estudiantesControlador.descargarPlantilla);
router.post('/cargar-excel', verificarSesionAPI, cargador.single('excel'), estudiantesControlador.cargarDesdeExcel);
router.get('/:id', verificarSesionAPI, estudiantesControlador.obtenerDetalle);

module.exports = router;
