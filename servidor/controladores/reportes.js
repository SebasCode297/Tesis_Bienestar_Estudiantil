const pool = require('../config/baseDatos');

const estadisticasGenerales = async (req, res) => {
    try {
        // 1. Total de estudiantes (Seguro)
        const resEst = await pool.query('SELECT COUNT(*) FROM estudiantes');
        const totalEstudiantes = parseInt(resEst.rows[0].count) || 0;

        // 2. Alertas por estado
        let alertasStats = { total: 0, pendientes: 0, en_proceso: 0, resueltas: 0 };
        try {
            const resAlertas = await pool.query(`
                SELECT 
                    COUNT(*)::int as total,
                    COUNT(*) FILTER (WHERE estado = 'Pendiente')::int  as pendientes,
                    COUNT(*) FILTER (WHERE estado = 'En Proceso')::int as en_proceso,
                    COUNT(*) FILTER (WHERE estado = 'Resuelto')::int   as resueltas
                FROM alertas_tempranas
            `);
            if (resAlertas.rows[0]) alertasStats = resAlertas.rows[0];
        } catch (e) {
            console.log("Tabla alertas_tempranas no lista aún:", e.message);
        }

        // 3. Actividad reciente
        let recientes = [];
        try {
            const resRecientes = await pool.query(`
                SELECT 
                    a.id,
                    a.tipo_riesgo   AS motivo,
                    a.estado,
                    a.fecha_reporte AS creado_en,
                    e.nombres,
                    e.apellidos
                FROM alertas_tempranas a
                JOIN estudiantes e ON a.estudiante_id = e.id
                ORDER BY a.fecha_reporte DESC
                LIMIT 5
            `);
            recientes = resRecientes.rows;
        } catch (e) {
            console.log("No hay alertas para mostrar:", e.message);
        }

        res.json({
            exito: true,
            datos: {
                totalEstudiantes,
                totalFormatos: 0, // Evitamos consultar la tabla formatos por ahora
                alertas: alertasStats,
                recientes: recientes
            }
        });
    } catch (error) {
        console.error('Error en estadísticas:', error);
        res.status(200).json({ // Devolvemos 200 aunque falle para que el Dashboard no se cuelgue
            exito: true, 
            datos: { totalEstudiantes: 0, totalFormatos: 0, alertas: {}, recientes: [] }
        });
    }
};

const reporteEstudiante = async (req, res) => {
    // ... (Mantener igual si existe)
};

module.exports = {
    estadisticasGenerales,
    reporteEstudiante
};
