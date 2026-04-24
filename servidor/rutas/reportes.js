// =============================================
// reportes.js — Rutas del módulo de Reportes
// =============================================

const express = require('express');
const router = express.Router();
const reportesControlador = require('../controladores/reportes');
const { verificarSesion } = require('../middlewares/verificarSesion');

// =============================================
// Endpoints API — Todos protegidos con verificarSesion
// =============================================

// GET /bienestar/api/reportes/estadisticas — Totales generales
router.get('/estadisticas', verificarSesion, reportesControlador.estadisticasGenerales);

// GET /bienestar/api/reportes/estudiante/:id — Reporte individual
router.get('/estudiante/:id', verificarSesion, reportesControlador.reporteEstudiante);

module.exports = router;
