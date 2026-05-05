// =============================================
// alertas.js — Controlador de Alertas Tempranas
// Gestiona el ciclo de vida de los casos estudiantiles
// =============================================

const pool = require('../config/baseDatos');

// 1. Obtener todas las alertas con los datos del estudiante
const listar = async (req, res) => {
    try {
        const resultado = await pool.query(`
            SELECT a.*, e.nombres, e.apellidos, e.cedula
            FROM alertas_tempranas a
            JOIN estudiantes e ON a.estudiante_id = e.id
            ORDER BY a.creado_en DESC
        `);
        res.json({ exito: true, datos: resultado.rows });
    } catch (error) {
        console.error('Error al listar alertas:', error);
        res.status(500).json({ exito: false, mensaje: 'Error al obtener alertas' });
    }
};

// 2. Crear una nueva alerta para un estudiante
const crear = async (req, res) => {
    try {
        const { estudiante_id, motivo, descripcion, prioridad } = req.body;

        if (!estudiante_id || !motivo) {
            return res.status(400).json({ exito: false, mensaje: 'Faltan datos obligatorios' });
        }

        const resultado = await pool.query(`
            INSERT INTO alertas_tempranas (estudiante_id, motivo, descripcion, prioridad)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `, [estudiante_id, motivo, descripcion || '', prioridad || 'Media']);

        res.json({ exito: true, mensaje: 'Alerta registrada correctamente', datos: resultado.rows[0] });
    } catch (error) {
        console.error('Error al crear alerta:', error);
        res.status(500).json({ exito: false, mensaje: 'Error al registrar alerta' });
    }
};

// 3. Cambiar el estado de una alerta (ej. de Pendiente a Resuelto)
const actualizarEstado = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;

        const resultado = await pool.query(`
            UPDATE alertas_tempranas 
            SET estado = $1, actualizado_en = NOW()
            WHERE id = $2 
            RETURNING *
        `, [estado, id]);

        if (resultado.rows.length === 0) {
            return res.status(404).json({ exito: false, mensaje: 'Alerta no encontrada' });
        }

        res.json({ exito: true, mensaje: 'Estado actualizado', datos: resultado.rows[0] });
    } catch (error) {
        console.error('Error al actualizar alerta:', error);
        res.status(500).json({ exito: false, mensaje: 'Error al actualizar estado' });
    }
};

// 4. Eliminar una alerta
const eliminar = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM alertas_tempranas WHERE id = $1', [id]);
        res.json({ exito: true, mensaje: 'Alerta eliminada' });
    } catch (error) {
        console.error('Error al eliminar alerta:', error);
        res.status(500).json({ exito: false, mensaje: 'Error al eliminar alerta' });
    }
};

module.exports = { listar, crear, actualizarEstado, eliminar };
