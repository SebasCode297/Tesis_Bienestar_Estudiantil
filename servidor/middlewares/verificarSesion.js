// =============================================
// verificarSesion.js — Middleware de protección de rutas
// Se ejecuta antes del controlador en rutas privadas.
// Si el usuario no tiene sesión activa, lo redirige al login.
// =============================================

// =============================================
// verificarSesion — Middleware para rutas protegidas
// Verifica que exista req.session.usuario con rol 'bienestar'
// =============================================
const verificarSesion = (req, res, next) => {
    if (req.session && req.session.usuario && req.session.usuario.rol === 'bienestar') {
        return next();
    }
    return res.redirect('/bienestar/login');
};

// Middleware para rutas API: devuelve JSON 401 en vez de redirigir
const verificarSesionAPI = (req, res, next) => {
    if (req.session && req.session.usuario && req.session.usuario.rol === 'bienestar') {
        return next();
    }
    return res.status(401).json({ exito: false, mensaje: 'Sesión no válida. Vuelve a iniciar sesión.' });
};

module.exports = { verificarSesion, verificarSesionAPI };
