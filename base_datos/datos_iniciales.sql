-- =============================================
-- datos_iniciales.sql — Datos de arranque del sistema
-- Inserta el usuario administrador del Departamento
-- de Bienestar Estudiantil con contraseña hasheada
-- =============================================

-- La contraseña '123456' fue procesada con bcrypt (10 rondas)
-- NUNCA almacenes contraseñas en texto plano en producción
INSERT INTO usuarios (correo, contrasena, rol, activo)
VALUES (
    'bienestar.estudiantil.istpet.edu.ec',
    '$2b$10$BQgwdeq..uBz7dP/ANsYNOyqOMYBuuWrn3oWU8EjyvT34SjT54B/e',
    'bienestar',
    TRUE
)
ON CONFLICT (correo) DO NOTHING; -- Evita duplicados si se ejecuta más de una vez
