// =============================================
// rutas/estudiantes.js — Rutas del módulo de Estudiantes
// =============================================

const express = require('express');
const router = express.Router();
const estudiantesControlador = require('../controladores/estudiantes');
const { verificarSesionAPI } = require('../middlewares/verificarSesion');
const multer = require('multer');

const cargador = multer({ storage: multer.memoryStorage() });

// GET /bienestar/api/estudiantes/ — Lista todos los estudiantes
router.get('/', verificarSesionAPI, estudiantesControlador.listar);

// GET /bienestar/api/estudiantes/buscar?q=... — Buscador predictivo para el modal de alertas
router.get('/buscar', verificarSesionAPI, estudiantesControlador.buscar);

// GET /bienestar/api/estudiantes/descargar-plantilla — Descarga el Excel de ejemplo
router.get('/descargar-plantilla', verificarSesionAPI, estudiantesControlador.descargarPlantilla);

// POST /bienestar/api/estudiantes/cargar-excel — Carga masiva desde Excel
router.post('/cargar-excel', verificarSesionAPI, cargador.single('excel'), estudiantesControlador.cargarDesdeExcel);

// GET /bienestar/api/estudiantes/:id — Detalle de un estudiante
router.get('/:id', verificarSesionAPI, estudiantesControlador.obtenerDetalle);

module.exports = router;
