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
    // Verifica si existe la sesión y si el usuario tiene rol de bienestar
    if (req.session && req.session.usuario && req.session.usuario.rol === 'bienestar') {
        // Sesión válida: permite continuar al controlador o ruta siguiente
        return next();
    }

    // Sin sesión válida: redirige al login
    return res.redirect('/bienestar/login');
};

// Exporta el middleware para usarlo en las rutas
module.exports = { verificarSesion };
