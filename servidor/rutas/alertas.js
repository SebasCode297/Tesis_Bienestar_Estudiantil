// =============================================
// rutas/alertas.js — Rutas del módulo de Alertas Tempranas
// Todas son rutas API → usan verificarSesionAPI (devuelve JSON 401)
// =============================================

const express = require('express');
const router = express.Router();
const alertasControlador = require('../controladores/alertas');
const { verificarSesionAPI } = require('../middlewares/verificarSesion');

// GET  /bienestar/api/alertas       — Lista todas las alertas
router.get('/', verificarSesionAPI, alertasControlador.listar);

// POST /bienestar/api/alertas       — Crea una nueva alerta
router.post('/', verificarSesionAPI, alertasControlador.crear);

// PUT  /bienestar/api/alertas/:id   — Cambia el estado de una alerta
router.put('/:id', verificarSesionAPI, alertasControlador.actualizarEstado);

// DELETE /bienestar/api/alertas/:id — Elimina una alerta
router.delete('/:id', verificarSesionAPI, alertasControlador.eliminar);

module.exports = router;
