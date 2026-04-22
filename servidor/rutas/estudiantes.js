// =============================================
// estudiantes.js — Rutas de gestión de estudiantes
// =============================================

const express = require('express');
const router = express.Router();
const estudiantesControlador = require('../controladores/estudiantes');
const { verificarSesion } = require('../middlewares/verificarSesion');
const multer = require('multer');

// Configuración de multer: guardamos en memoria RAM para transacciones súper rápidas de Excel
// sin necesidad de archivar el documento "basura" en el disco de la aplicación
const cargador = multer({ storage: multer.memoryStorage() });

// =============================================
// Endpoints API — Todos protegidos con verificarSesion
// =============================================

// GET /bienestar/api/estudiantes — Lista todos (acepta ?buscar=texto opcional)
router.get('/', verificarSesion, estudiantesControlador.listar);

// GET /bienestar/api/estudiantes/descargar-plantilla — Entrega el archivo Excel vacío con las cabeceras
router.get('/descargar-plantilla', verificarSesion, estudiantesControlador.descargarPlantilla);

// POST /bienestar/api/estudiantes/cargar-masiva — Recibe y parsea el archivo Excel
router.post('/cargar-masiva', verificarSesion, cargador.single('archivo_datos'), estudiantesControlador.cargarMasiva);

// GET /bienestar/api/estudiantes/:id — Detalle de 1 estudiante + formatos subidos y vinculados actualmente
router.get('/:id', verificarSesion, estudiantesControlador.obtenerDetalle);

// POST /bienestar/api/estudiantes/:id/formatos — Vincula un formato oficial a un estudiante para que él lo vea
router.post('/:id/formatos', verificarSesion, estudiantesControlador.vincularFormato);

// DELETE /bienestar/api/estudiantes/:estudianteId/formatos/:asignacionId — Retira o revoca la vinculación
router.delete('/:estudianteId/formatos/:asignacionId', verificarSesion, estudiantesControlador.desvincularFormato);

module.exports = router;
