-- =============================================
-- esquema.sql — Estructura de la base de datos
-- Ejecutar este archivo en pgAdmin antes de iniciar el sistema
-- =============================================

-- Crea la base de datos (ejecutar si aún no existe)
-- CREATE DATABASE bienestar_estudiantil;

-- =============================================
-- Tabla: usuarios
-- Almacena las credenciales y roles de todos los
-- usuarios que pueden acceder al sistema
-- =============================================
CREATE TABLE IF NOT EXISTS usuarios (
    id          SERIAL PRIMARY KEY,                  -- ID autoincremental
    correo      VARCHAR(150) UNIQUE NOT NULL,        -- Correo único por usuario
    contrasena  VARCHAR(255) NOT NULL,               -- Contraseña hasheada con bcrypt
    rol         VARCHAR(50) NOT NULL,                -- Rol: 'bienestar', 'estudiante', 'docente'
    activo      BOOLEAN DEFAULT TRUE,                -- Indica si el usuario está habilitado
    creado_en   TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- Fecha y hora de creación
);
