// =============================================
// autenticacion.js — Rutas de autenticación
// Define los endpoints HTTP para el login y logout
// del sistema. Conecta las URLs con los controladores.
// =============================================

// Importa el módulo Router de Express para definir rutas
const express = require('express');
const router  = express.Router();

// Importa el controlador de autenticación (capa de negocio)
const autenticacionControlador = require('../controladores/autenticacion');

// Importa el middleware que protege rutas privadas
const { verificarSesion } = require('../middlewares/verificarSesion');

// =============================================
// GET /bienestar/login
// Sirve la página HTML del formulario de login
// Si ya hay sesión activa, redirige al panel
// =============================================
router.get('/login', (req, res) => {
    // Si el usuario ya tiene sesión iniciada, lo manda al panel
    if (req.session.usuario && req.session.usuario.rol === 'bienestar') {
        return res.redirect('/bienestar/panel');
    }
    // Si no tiene sesión, sirve el HTML del login
    const path = require('path');
    res.sendFile(path.join(__dirname, '../../cliente/bienestar/login.html'));
});

// =============================================
// POST /bienestar/auth/login
// Recibe las credenciales del formulario (JSON)
// y las pasa al controlador para verificación
// =============================================
router.post('/auth/login', autenticacionControlador.iniciarSesion);

// =============================================
// GET /bienestar/panel
// Página principal del rol Bienestar (protegida)
// Solo accesible con sesión activa y rol correcto
// =============================================
router.get('/panel', verificarSesion, (req, res) => {
    const path = require('path');
    res.sendFile(path.join(__dirname, '../../cliente/bienestar/panel/index.html'));
});

// =============================================
// GET /bienestar/api/sesion
// Devuelve la información del usuario logueado
// El frontend lo usa para mostrar el correo en el sidebar
// =============================================
router.get('/api/sesion', verificarSesion, (req, res) => {
    res.json({
        exito: true,
        datos: { correo: req.session.usuario.correo, rol: req.session.usuario.rol }
    });
});

// =============================================
// GET /bienestar/cerrar-sesion
// Cierra la sesión activa y redirige al login
// =============================================
router.get('/cerrar-sesion', autenticacionControlador.cerrarSesion);

// Exporta el router para registrarlo en app.js
module.exports = router;
