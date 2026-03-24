// =============================================
// estudiantes.js — Rutas de gestión de estudiantes
// =============================================

const express = require('express');
const router = express.Router();
const estudiantesControlador = require('../controladores/estudiantes');
const { verificarSesion } = require('../middlewares/verificarSesion');

// =============================================
// Endpoints API — Todos protegidos con verificarSesion
// =============================================

// GET /bienestar/api/estudiantes — Lista todos (acepta ?buscar=texto)
router.get('/', verificarSesion, estudiantesControlador.listar);

// POST /bienestar/api/estudiantes — Registra un nuevo estudiante
router.post('/', verificarSesion, estudiantesControlador.registrar);

// GET /bienestar/api/estudiantes/:id — Detalle + formatos vinculados
router.get('/:id', verificarSesion, estudiantesControlador.obtenerDetalle);

// POST /bienestar/api/estudiantes/:id/formatos — Vincula un formato
router.post('/:id/formatos', verificarSesion, estudiantesControlador.vincularFormato);

// DELETE /bienestar/api/estudiantes/:estudianteId/formatos/:asignacionId — Desvincula
router.delete('/:estudianteId/formatos/:asignacionId', verificarSesion, estudiantesControlador.desvincularFormato);

module.exports = router;
