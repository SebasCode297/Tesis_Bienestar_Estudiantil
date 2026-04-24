// =============================================
// app.js — Punto de entrada del servidor
// Arquitectura en 3 capas:
//   - Presentación: carpeta /cliente (HTML/CSS/JS)
//   - Negocio:      /controladores
//   - Datos:        /modelos (consultas PostgreSQL)
// =============================================

// Carga las variables de entorno desde el archivo .env
require('dotenv').config();
// CACHE_BUSTER_V2: Forzando reconstrucción total en Vercel

// Importa los módulos principales
const express = require('express');
const session = require('express-session');
const path    = require('path');
const pool    = require('./config/baseDatos');

// Crea la instancia de la aplicación Express
const app   = express();
const PUERTO = process.env.PUERTO || 3000;

// Configuración para Vercel: confiar en el proxy para manejar sesiones seguras en HTTPS
app.set('trust proxy', 1);

// =============================================
// MIDDLEWARES GLOBALES
// Se aplican a TODAS las solicitudes entrantes
// =============================================

// Sirve los archivos estáticos de la capa de presentación
app.use(express.static(path.join(__dirname, '..', 'cliente')));

// Sirve los archivos subidos (informes, plantillas)
app.use('/almacenamiento', express.static(path.join(__dirname, '..', 'almacenamiento')));

// Permite que Express entienda JSON en el cuerpo de las solicitudes
app.use(express.json());

// Permite que Express entienda datos de formularios HTML
app.use(express.urlencoded({ extended: true }));

// =============================================
// CONFIGURACIÓN DE SESIONES
// Se usa connect-pg-simple para que las sesiones
// persistan en la base de datos (necesario en Vercel)
// =============================================
// Configuración de sesiones en memoria RAM (temporalmente para evitar errores de tabla de BD)
app.use(session({
    secret:            process.env.SESION_SECRETO || 'bienestar_istpet_secreto_2026',
    resave:            false,
    saveUninitialized: false,
    cookie: {
        maxAge:   3600000,
        httpOnly: true,
        secure:   process.env.NODE_ENV === 'production'
    }
}));

// =============================================
// RUTAS DE LA APLICACIÓN
// Cada módulo tiene su propio archivo de rutas
// =============================================

// Importa las rutas de cada módulo para separar la lógica por responsabilidades
const rutasBienestar   = require('./rutas/autenticacion'); // Importa rutas de login y sesión
const rutasEstudiantes = require('./rutas/estudiantes'); // Importa rutas para gestión de datos de alumnos
const rutasReportes    = require('./rutas/reportes'); // Importa rutas para generación de estadísticas
const rutasAlertas     = require('./rutas/alertas'); // Importa rutas para el sistema de alertas tempranas

// Registra las rutas de autenticación bajo el prefijo '/bienestar' para acceso público
app.use('/bienestar', rutasBienestar); // Middleware que monta las rutas de autenticación

// Registra las APIs protegidas de cada módulo funcional del sistema
app.use('/bienestar/api/estudiantes', rutasEstudiantes); // Punto final para CRUD de estudiantes
app.use('/bienestar/api/reportes', rutasReportes); // Punto final para obtener datos de reportes
app.use('/bienestar/api/alertas', rutasAlertas); // Punto final para la gestión de alertas


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
// En Vercel, el servidor se maneja como una función serverless.
// Solo ejecutamos app.listen si no estamos en un entorno de Vercel.
// =============================================
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(PUERTO, () => {
        console.log(`✅ Servidor corriendo en http://localhost:${PUERTO}`);
        console.log(`🏫 Sistema Bienestar Estudiantil — ISTPET`);
        console.log(`📂 Arquitectura: 3 capas (Presentación / Negocio / Datos)`);
    });
}

// Exportar la aplicación para que Vercel pueda usarla como serverless function
module.exports = app;
