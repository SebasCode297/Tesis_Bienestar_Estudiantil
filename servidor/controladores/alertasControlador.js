// =============================================
// alertasControlador.js — Controlador de Alertas (Bienestar)
// Gestión de alertas tempranas emitidas por los docentes
// =============================================

const pool = require('../config/baseDatos');

// Listar todas las alertas con filtros opcionales
// Query params: ?estado=Pendiente&carrera=xxx&buscar=nombre
const listarAlertas = async (req, res) => {
    try {
        const { estado, carrera, buscar } = req.query;

        let consulta = `
            SELECT 
                a.id,
                a.materia,
                a.tipo_riesgo,
                a.observacion,
                a.estado,
                a.estudiante_enterado,
                a.fecha_reporte,
                e.nombres       AS estudiante_nombres,
                e.apellidos     AS estudiante_apellidos,
                e.cedula        AS estudiante_cedula,
                e.carrera       AS estudiante_carrera,
                e.semestre      AS estudiante_semestre,
                u.correo        AS docente_correo
            FROM alertas_tempranas a
            JOIN estudiantes e ON a.estudiante_id = e.id
            LEFT JOIN usuarios u ON a.docente_id = u.id
            WHERE 1=1
        `;
        const params = [];
        let idx = 1;

        if (estado && estado !== 'Todos') {
            consulta += ` AND a.estado = $${idx++}`;
            params.push(estado);
        }

        if (carrera && carrera !== '') {
            consulta += ` AND e.carrera = $${idx++}`;
            params.push(carrera);
        }

        if (buscar && buscar.trim()) {
            consulta += ` AND (e.nombres ILIKE $${idx} OR e.apellidos ILIKE $${idx} OR e.cedula ILIKE $${idx})`;
            params.push(`%${buscar.trim()}%`);
            idx++;
        }

        consulta += ' ORDER BY a.fecha_reporte DESC';

        const resultado = await pool.query(consulta, params);
        res.json({ exito: true, datos: resultado.rows });

    } catch (error) {
        console.error('Error al listar alertas:', error);
        res.status(500).json({ exito: false, mensaje: 'Error interno del servidor' });
    }
};

// Cambiar el estado de una alerta (Pendiente → En Proceso → Resuelto)
const cambiarEstado = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;

        const estadosValidos = ['Pendiente', 'En Proceso', 'Resuelto'];
        if (!estadosValidos.includes(estado)) {
            return res.status(400).json({ exito: false, mensaje: 'Estado no válido' });
        }

        const resultado = await pool.query(
            'UPDATE alertas_tempranas SET estado = $1 WHERE id = $2 RETURNING *',
            [estado, id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({ exito: false, mensaje: 'Alerta no encontrada' });
        }

        res.json({ exito: true, mensaje: `Estado actualizado a "${estado}"`, datos: resultado.rows[0] });

    } catch (error) {
        console.error('Error al cambiar estado:', error);
        res.status(500).json({ exito: false, mensaje: 'Error interno del servidor' });
    }
};

// Estadísticas de alertas por estado y tipo de riesgo
const estadisticasAlertas = async (req, res) => {
    try {
        const porEstado = await pool.query(`
            SELECT estado, COUNT(*) AS total
            FROM alertas_tempranas
            GROUP BY estado
            ORDER BY total DESC
        `);

        const porRiesgo = await pool.query(`
            SELECT tipo_riesgo, COUNT(*) AS total
            FROM alertas_tempranas
            GROUP BY tipo_riesgo
            ORDER BY total DESC
        `);

        const totalEnterados = await pool.query(`
            SELECT COUNT(*) AS total FROM alertas_tempranas WHERE estudiante_enterado = TRUE
        `);

        const totalAlertas = await pool.query('SELECT COUNT(*) AS total FROM alertas_tempranas');

        res.json({
            exito: true,
            datos: {
                porEstado:     porEstado.rows,
                porRiesgo:     porRiesgo.rows,
                enterados:     parseInt(totalEnterados.rows[0].total),
                total:         parseInt(totalAlertas.rows[0].total)
            }
        });

    } catch (error) {
        console.error('Error en estadísticas de alertas:', error);
        res.status(500).json({ exito: false, mensaje: 'Error interno del servidor' });
    }
};

// Alertas específicas de un estudiante (para el detalle del historial)
const alertasPorEstudiante = async (req, res) => {
    try {
        const { estudianteId } = req.params;

        const resultado = await pool.query(`
            SELECT 
                a.id, a.materia, a.tipo_riesgo, a.observacion, a.estado,
                a.estudiante_enterado, a.fecha_reporte,
                u.correo AS docente_correo
            FROM alertas_tempranas a
            LEFT JOIN usuarios u ON a.docente_id = u.id
            WHERE a.estudiante_id = $1
            ORDER BY a.fecha_reporte DESC
        `, [estudianteId]);

        res.json({ exito: true, datos: resultado.rows });

    } catch (error) {
        console.error('Error al obtener alertas del estudiante:', error);
        res.status(500).json({ exito: false, mensaje: 'Error interno del servidor' });
    }
};

module.exports = {
    listarAlertas,
    cambiarEstado,
    estadisticasAlertas,
    alertasPorEstudiante
};
