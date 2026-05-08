// =============================================
// alertas.js — Controlador de Alertas Tempranas
// Usa los nombres de columna reales de la tabla alertas_tempranas:
// id, estudiante_id, tipo_riesgo, observacion, estado, fecha_reporte
// =============================================

const pool = require('../config/baseDatos');

// 1. Listar todas las alertas con datos del estudiante
const listar = async (req, res) => {
    try {
        const resultado = await pool.query(`
            SELECT 
                a.id,
                a.tipo_riesgo   AS motivo,
                a.observacion,
                a.estado,
                a.fecha_reporte AS creado_en,
                e.nombres,
                e.apellidos,
                e.cedula
            FROM alertas_tempranas a
            JOIN estudiantes e ON a.estudiante_id = e.id
            ORDER BY a.fecha_reporte DESC
        `);
        res.json({ exito: true, datos: resultado.rows });
    } catch (error) {
        console.error('Error al listar alertas:', error.message);
        res.status(500).json({ exito: false, mensaje: 'Error al obtener alertas: ' + error.message });
    }
};

// 2. Crear una nueva alerta
const crear = async (req, res) => {
    try {
        const { estudiante_id, motivo, descripcion } = req.body;

        if (!estudiante_id || !motivo) {
            return res.status(400).json({ exito: false, mensaje: 'Faltan datos: estudiante y motivo son obligatorios' });
        }

        const resultado = await pool.query(`
            INSERT INTO alertas_tempranas (estudiante_id, tipo_riesgo, observacion)
            VALUES ($1, $2, $3)
            RETURNING *
        `, [estudiante_id, motivo, descripcion || '']);

        res.json({ exito: true, mensaje: 'Alerta registrada correctamente', datos: resultado.rows[0] });
    } catch (error) {
        console.error('Error al crear alerta:', error.message);
        res.status(500).json({ exito: false, mensaje: 'Error al registrar alerta: ' + error.message });
    }
};

// 3. Cambiar el estado de una alerta
const actualizarEstado = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;

        const estadosValidos = ['Pendiente', 'En Proceso', 'Resuelto'];
        if (!estadosValidos.includes(estado)) {
            return res.status(400).json({ exito: false, mensaje: 'Estado no válido' });
        }

        const resultado = await pool.query(`
            UPDATE alertas_tempranas 
            SET estado = $1
            WHERE id = $2 
            RETURNING *
        `, [estado, id]);

        if (resultado.rows.length === 0) {
            return res.status(404).json({ exito: false, mensaje: 'Alerta no encontrada' });
        }

        res.json({ exito: true, mensaje: 'Estado actualizado', datos: resultado.rows[0] });
    } catch (error) {
        console.error('Error al actualizar alerta:', error.message);
        res.status(500).json({ exito: false, mensaje: 'Error al actualizar estado' });
    }
};

// 4. Eliminar una alerta
const eliminar = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM alertas_tempranas WHERE id = $1', [id]);
        res.json({ exito: true, mensaje: 'Alerta eliminada correctamente' });
    } catch (error) {
        console.error('Error al eliminar alerta:', error.message);
        res.status(500).json({ exito: false, mensaje: 'Error al eliminar alerta' });
    }
};

module.exports = { listar, crear, actualizarEstado, eliminar };
