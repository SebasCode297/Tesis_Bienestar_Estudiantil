const express = require('express');
const router = express.Router();
const formatosControlador = require('../controladores/formatos');
const { verificarSesionAPI } = require('../middlewares/verificarSesion');
const multer = require('multer');

const cargador = multer({ storage: multer.memoryStorage() });

// GET  /bienestar/api/formatos           — Lista todos los formatos
// GET  /bienestar/api/formatos/:id       — Detalle de un formato
// POST /bienestar/api/formatos/subir     — Sube un Word y lo convierte
// PUT  /bienestar/api/formatos/:id       — Guarda edición del editor
// DELETE /bienestar/api/formatos/:id     — Elimina un formato

router.get('/', verificarSesionAPI, formatosControlador.listar);
router.get('/:id', verificarSesionAPI, formatosControlador.obtenerDetalle);
router.post('/subir', verificarSesionAPI, cargador.single('word'), formatosControlador.subirDesdeWord);
router.post('/subir-vacio', verificarSesionAPI, formatosControlador.crearVacio);
router.put('/:id', verificarSesionAPI, formatosControlador.guardarEdicion);
router.delete('/:id', verificarSesionAPI, formatosControlador.eliminar);

module.exports = router;
