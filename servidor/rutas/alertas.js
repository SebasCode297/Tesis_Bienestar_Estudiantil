// =============================================
// alertas.js — Rutas del módulo Alertas (Bienestar)
// Permite a Bienestar ver y gestionar las alertas
// =============================================

const express = require('express');
const router  = express.Router();
const alertasControlador = require('../controladores/alertasControlador');
const { verificarSesion } = require('../middlewares/verificarSesion');
const multer = require('multer');
const path = require('path');

// Configuración de multer para alertas (Sustento docente)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', 'almacenamiento'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'INFORME-DOCENTE-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// GET  /bienestar/api/alertas — Listar todas las alertas
router.get('/', verificarSesion, alertasControlador.listarAlertas);

// POST /bienestar/api/alertas/registrar-externo — Bienestar registra informe manual
router.post('/registrar-externo', verificarSesion, upload.single('archivo'), alertasControlador.crearAlertaExterna);

// GET  /bienestar/api/alertas/estadisticas — Conteo por estado y tipo de riesgo
router.get('/estadisticas', verificarSesion, alertasControlador.estadisticasAlertas);

// PATCH /bienestar/api/alertas/:id/estado — Cambiar estado de una alerta
router.patch('/:id/estado', verificarSesion, alertasControlador.cambiarEstado);

// GET /bienestar/api/alertas/estudiante/:estudianteId — Alertas de un estudiante específico
router.get('/estudiante/:estudianteId', verificarSesion, alertasControlador.alertasPorEstudiante);

module.exports = router;
