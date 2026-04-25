// =============================================
// autenticacion.js — Controlador de la capa de Negocio
// Contiene la lógica para verificar las credenciales
// del usuario y gestionar el inicio/cierre de sesión.
// Usa el modelo 'usuario' para acceder a la BD.
// =============================================

// Importa la librería de hashing de contraseñas
const bcrypt = require('bcryptjs');

// Importa el modelo de usuario (capa de datos)
const usuarioModelo = require('../modelos/usuario');

// =============================================
// iniciarSesion — Maneja el POST del formulario de login
// Recibe correo y contraseña, verifica contra la BD
// y crea la sesión si las credenciales son correctas
// =============================================
const iniciarSesion = async (req, res) => {
    try {
        // Extrae los datos enviados desde el formulario del frontend
        const { correo, contrasena } = req.body;

        // Validación básica: ambos campos son obligatorios
        if (!correo || !contrasena) {
            return res.status(400).json({
                exito: false,
                mensaje: 'Todos los campos son obligatorios'
            });
        }

        // Busca el usuario en la base de datos por su correo
        const usuario = await usuarioModelo.buscarPorCorreo(correo);

        // Si no existe el correo, responde con error genérico
        // (no revelamos si el correo existe o no por seguridad)
        if (!usuario) {
            return res.status(401).json({
                exito: false,
                mensaje: 'Credenciales incorrectas'
            });
        }

        // Compara la contraseña ingresada con el hash almacenado en la BD
        const contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena);

        // Si la contraseña no coincide, responde con error
        if (!contrasenaValida) {
            return res.status(401).json({
                exito: false,
                mensaje: 'Credenciales incorrectas'
            });
        }

        // Verifica que el rol del usuario sea 'bienestar'
        // (este login es exclusivo para ese departamento)
        if (usuario.rol !== 'bienestar') {
            return res.status(403).json({
                exito: false,
                mensaje: 'Acceso no autorizado para este rol'
            });
        }

        // ✅ Credenciales correctas: crea la sesión del usuario
        // Guarda solo los datos necesarios en la sesión (nunca la contraseña)
        req.session.usuario = {
            id:     usuario.id,
            correo: usuario.correo,
            rol:    usuario.rol
        };

        // Responde con éxito y la URL a la que debe redirigir el frontend
        return res.status(200).json({
            exito: true,
            redirigir: '/bienestar/panel'
        });

    } catch (error) {
        // Captura cualquier error inesperado del servidor
        console.error('❌ Error en iniciarSesion:', error.message);
        return res.status(500).json({
            exito: false,
            mensaje: 'Error interno del servidor'
        });
    }
};

// =============================================
// cerrarSesion — Destruye la sesión activa
// y redirige al login
// =============================================
const cerrarSesion = (req, res) => {
    req.session.destroy((error) => {
        if (error) {
            console.error('❌ Error al cerrar sesión:', error.message);
        }
        // Siempre redirige al login, sin importar si hubo error
        res.redirect('/bienestar/login');
    });
};

// Exporta las funciones del controlador
module.exports = {
    iniciarSesion,
    cerrarSesion,
};
