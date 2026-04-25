// =============================================
// reportes.js — Controlador de la capa de Negocio
// Consultas estadísticas para el Dashboard
// =============================================

const pool = require('../config/baseDatos');
const estudianteModelo = require('../modelos/estudiante');

// Estadísticas generales del sistema para el Dashboard principal
const estadisticasGenerales = async (req, res) => {
    try {
        // Total de estudiantes registrados en el sistema
        const totalEstudiantes = await pool.query('SELECT COUNT(*) FROM estudiantes');

        // Conteo de alertas por estado (Pendiente, En Proceso, Resuelto)
        const alertasStats = await pool.query(`
            SELECT 
                COUNT(*) as total,
                COUNT(*) FILTER (WHERE estado = 'Pendiente') as pendientes,
                COUNT(*) FILTER (WHERE estado = 'En Proceso') as en_proceso,
                COUNT(*) FILTER (WHERE estado = 'Resuelto') as resueltas
            FROM alertas_tempranas
        `);

        res.json({
            exito: true,
            datos: {
                totalEstudiantes: parseInt(totalEstudiantes.rows[0].count),
                alertas: alertasStats.rows[0]
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
