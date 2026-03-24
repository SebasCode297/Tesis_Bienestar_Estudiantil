// =============================================
// app.js — Punto de entrada del servidor
// Arquitectura en 3 capas:
//   - Presentación: carpeta /cliente (HTML/CSS/JS)
//   - Negocio:      /controladores
//   - Datos:        /modelos (consultas PostgreSQL)
// =============================================

// Carga las variables de entorno desde el archivo .env
require('dotenv').config();

// Importa los módulos principales
const express = require('express');
const session = require('express-session');
const path    = require('path');

// Crea la instancia de la aplicación Express
const app   = express();
const PUERTO = process.env.PUERTO || 3000;

// =============================================
// MIDDLEWARES GLOBALES
// Se aplican a TODAS las solicitudes entrantes
// =============================================

// Sirve los archivos estáticos de la capa de presentación
// 'cliente/' contiene todos los HTML, CSS e imágenes del frontend
app.use(express.static(path.join(__dirname, '..', 'cliente')));

// Permite que Express entienda JSON en el cuerpo de las solicitudes
app.use(express.json());

// Permite que Express entienda datos de formularios HTML
app.use(express.urlencoded({ extended: true }));

// =============================================
// CONFIGURACIÓN DE SESIONES
// express-session maneja las sesiones de usuario
// en memoria (para desarrollo)
// =============================================
app.use(session({
    secret:            process.env.SESION_SECRETO || 'bienestar_istpet_secreto_2026',
    resave:            false,  // No guarda la sesión si no hubo cambios
    saveUninitialized: false,  // No crea sesión si no hay datos
    cookie: {
        maxAge:   3600000, // La sesión dura 1 hora (en milisegundos)
        httpOnly: true,    // La cookie no es accesible desde JS del cliente (seguridad)
        secure:   false    // true solo en producción con HTTPS
    }
}));

// =============================================
// RUTAS DE LA APLICACIÓN
// Cada módulo tiene su propio archivo de rutas
// =============================================

// Importa las rutas de cada módulo
const rutasBienestar   = require('./rutas/autenticacion');
const rutasFormatos    = require('./rutas/formatos');
const rutasEstudiantes = require('./rutas/estudiantes');
const rutasReportes    = require('./rutas/reportes');

// Registra las rutas bajo el prefijo '/bienestar'
app.use('/bienestar', rutasBienestar);

// Registra las APIs protegidas de cada módulo
app.use('/bienestar/api/formatos', rutasFormatos);
app.use('/bienestar/api/estudiantes', rutasEstudiantes);
app.use('/bienestar/api/reportes', rutasReportes);

// =============================================
// RUTA PRINCIPAL — página de inicio
// Sirve el index.html de la carpeta inicio/
// =============================================
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'cliente', 'inicio', 'index.html'));
});

// =============================================
// MANEJO DE RUTAS NO ENCONTRADAS (404)
// Si ninguna ruta coincide, responde con 404
// =============================================
app.use((req, res) => {
    res.status(404).send(`
        <div style="font-family:Arial;text-align:center;padding:80px;color:#1e2a6e;">
            <h1 style="font-size:4rem;color:#c9a227;">404</h1>
            <p>Página no encontrada</p>
            <a href="/" style="color:#1e2a6e;">← Volver al inicio</a>
        </div>
    `);
});

// =============================================
// INICIO DEL SERVIDOR
// =============================================
app.listen(PUERTO, () => {
    console.log(`✅ Servidor corriendo en http://localhost:${PUERTO}`);
    console.log(`🏫 Sistema Bienestar Estudiantil — ISTPET`);
    console.log(`📂 Arquitectura: 3 capas (Presentación / Negocio / Datos)`);
});
