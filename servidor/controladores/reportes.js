// =============================================
// reportes.js — Controlador de la capa de Negocio
// Consultas estadísticas para el módulo de Reportes
// =============================================

const pool = require('../config/baseDatos');
const estudianteModelo = require('../modelos/estudiante');

// Estadísticas generales del sistema (Reforzado para Tesis)
const estadisticasGenerales = async (req, res) => {
    try {
        // Total de estudiantes registrados
        const totalEstudiantes = await pool.query('SELECT COUNT(*) FROM estudiantes');

        // Eficacia de Alertas (Control de Gestión)
        const alertasStats = await pool.query(`
            SELECT 
                COUNT(*) as total,
                COUNT(*) FILTER (WHERE estado = 'Pendiente') as pendientes,
                COUNT(*) FILTER (WHERE estado = 'En Proceso') as en_proceso,
                COUNT(*) FILTER (WHERE estado = 'Resuelto') as resueltas
            FROM alertas_tempranas
        `);

        // Distribución por Carrera (Para gráficos)
        const porCarrera = await pool.query(`
            SELECT carrera, COUNT(*) as cantidad 
            FROM estudiantes 
            GROUP BY carrera 
            ORDER BY cantidad DESC
        `);

        res.json({
            exito: true,
            datos: {
                totalEstudiantes:   parseInt(totalEstudiantes.rows[0].count),
                alertas:            alertasStats.rows[0],
                porCarrera:         porCarrera.rows[0] ? porCarrera.rows : []
            }
        });
    } catch (error) {
        console.error('Error en estadísticas:', error);
        res.status(500).json({ exito: false, mensaje: 'Error al obtener estadísticas' });
    }
};

// Reporte individual de un estudiante
const reporteEstudiante = async (req, res) => {
    try {
        const { id } = req.params;
        const estudiante = await estudianteModelo.obtenerPorId(id);

        if (!estudiante) {
            return res.status(404).json({ exito: false, mensaje: 'Estudiante no encontrado' });
        }

        res.json({
            exito: true,
            datos: {
                estudiante
            }
        });
    } catch (error) {
        console.error('Error en reporte:', error);
        res.status(500).json({ exito: false, mensaje: 'Error al generar reporte' });
    }
};

module.exports = {
    estadisticasGenerales,
    reporteEstudiante
};
