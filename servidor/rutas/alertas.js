const express = require('express');
const router = express.Router();
const alertasControlador = require('../controladores/alertas');

// Importa el middleware que protege rutas privadas
const { verificarSesion } = require('../middlewares/verificarSesion');

// Todas las rutas de alertas requieren que el usuario esté logueado
router.get('/', verificarSesion, alertasControlador.listar);
router.post('/', verificarSesion, alertasControlador.crear);
router.put('/:id', verificarSesion, alertasControlador.actualizarEstado);
router.delete('/:id', verificarSesion, alertasControlador.eliminar);

module.exports = router;
