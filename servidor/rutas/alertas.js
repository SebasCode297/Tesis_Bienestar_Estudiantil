// =============================================
// alertas.js — Rutas del módulo Alertas (Bienestar)
// Permite a Bienestar ver y gestionar las alertas
// =============================================

const express = require('express');
const router  = express.Router();
const alertasControlador = require('../controladores/alertasControlador');
const { verificarSesion } = require('../middlewares/verificarSesion');

// GET  /bienestar/api/alertas            — Listar todas las alertas (con filtros opcionales)
router.get('/', verificarSesion, alertasControlador.listarAlertas);

// GET  /bienestar/api/alertas/estadisticas — Conteo por estado y tipo de riesgo
router.get('/estadisticas', verificarSesion, alertasControlador.estadisticasAlertas);

// PATCH /bienestar/api/alertas/:id/estado — Cambiar estado de una alerta
router.patch('/:id/estado', verificarSesion, alertasControlador.cambiarEstado);

// GET /bienestar/api/alertas/estudiante/:estudianteId — Alertas de un estudiante específico
router.get('/estudiante/:estudianteId', verificarSesion, alertasControlador.alertasPorEstudiante);

module.exports = router;
