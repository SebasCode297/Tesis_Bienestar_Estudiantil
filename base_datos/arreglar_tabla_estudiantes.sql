-- =============================================
-- arreglar_tabla_estudiantes.sql
-- EJECUTAR EN NEON.TECH SQL EDITOR
-- Hace que carrera y semestre sean opcionales
-- y agrega la columna telefono que faltaba
-- =============================================

ALTER TABLE estudiantes ALTER COLUMN carrera DROP NOT NULL;
ALTER TABLE estudiantes ALTER COLUMN semestre DROP NOT NULL;
ALTER TABLE estudiantes ADD COLUMN IF NOT EXISTS telefono VARCHAR(20);
