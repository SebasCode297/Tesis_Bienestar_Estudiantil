// =============================================
// reportes.js — Controlador de la capa de Negocio
// Consultas estadísticas para el Dashboard
// =============================================

const pool = require('../config/baseDatos');
const estudianteModelo = require('../modelos/estudiante');

// Estadísticas generales del sistema para el Dashboard principal
const estadisticasGenerales = async (req, res) => {
    try {
        // 1. Total de estudiantes
        const resEst = await pool.query('SELECT COUNT(*) FROM estudiantes');
        const totalEstudiantes = parseInt(resEst.rows[0].count) || 0;

        // 2. Conteo de alertas por estado
        const resAlertas = await pool.query(`
            SELECT 
                COUNT(*)::int as total,
                COUNT(*) FILTER (WHERE estado = 'Pendiente')::int as pendientes,
                COUNT(*) FILTER (WHERE estado = 'En Proceso')::int as en_proceso,
                COUNT(*) FILTER (WHERE estado = 'Resuelto')::int as resueltas
            FROM alertas_tempranas
        `);
        const alertasStats = resAlertas.rows[0] || { total: 0, pendientes: 0, en_proceso: 0, resueltas: 0 };

        // 3. Total de formatos configurados
        const resForm = await pool.query('SELECT COUNT(*) FROM formatos');
        const totalFormatos = parseInt(resForm.rows[0].count) || 0;

        // 4. Últimas 5 alertas (Actividad reciente)
        const resRecientes = await pool.query(`
            SELECT a.id, a.motivo, a.estado, a.creado_en, e.nombres, e.apellidos
            FROM alertas_tempranas a
            JOIN estudiantes e ON a.estudiante_id = e.id
            ORDER BY a.creado_en DESC
            LIMIT 5
        `);

        res.json({
            exito: true,
            datos: {
                totalEstudiantes,
                totalFormatos,
                alertas: alertasStats,
                recientes: resRecientes.rows
            }
        });
    } catch (error) {
        console.error('Error en estadísticas:', error);
        res.status(500).json({ exito: false, mensaje: 'Error al obtener estadísticas' });
    }
};

// Reporte individual de un estudiante por su ID
const reporteEstudiante = async (req, res) => {
    try {
        const { id } = req.params;
        const estudiante = await estudianteModelo.obtenerPorId(id);

        if (!estudiante) {
            return res.status(404).json({ exito: false, mensaje: 'Estudiante no encontrado' });
        }

        res.json({ exito: true, datos: { estudiante } });
    } catch (error) {
        console.error('Error en reporte:', error);
        res.status(500).json({ exito: false, mensaje: 'Error al generar reporte' });
    }
};

module.exports = {
    estadisticasGenerales,
    reporteEstudiante
};
