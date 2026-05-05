const express = require('express');
const router = express.Router();
const alertasControlador = require('../controladores/alertas');

// Middleware para verificar sesión (asumo que está en autenticacion)
const { verificarSesion } = require('./autenticacion');

// Todas las rutas de alertas requieren que el usuario esté logueado
router.get('/', verificarSesion, alertasControlador.listar);
router.post('/', verificarSesion, alertasControlador.crear);
router.put('/:id', verificarSesion, alertasControlador.actualizarEstado);
router.delete('/:id', verificarSesion, alertasControlador.eliminar);

module.exports = router;
