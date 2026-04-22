const { Pool } = require('pg');
const definicionJustificacionFaltas = require('./config/definicionJustificacionFaltas');

const pool = new Pool({
    host: 'localhost',
    user: 'postgres',
    password: '1234',
    database: 'bienestar_estudiantil',
    port: 5432
});

const formatosConfig = [
    {
        nombre: 'ANEXO 1 - OFICIO',
        campos: [
            { id: 'fecha', label: 'Fecha (ej: 08 de Mayo de 2023)', placeholder: '[[FECHA]]', tipo: 'texto' },
            { id: 'nombre', label: 'Nombres Completos del Estudiante', placeholder: '[[NOMBRE]]', tipo: 'texto' },
            { id: 'cedula', label: 'Cédula de Identidad (C.I.)', placeholder: '[[CEDULA]]', tipo: 'texto' },
            { id: 'carrera', label: 'Carrera (ej: Desarrollo de Software)', placeholder: '[[CARRERA]]', tipo: 'texto' },
            { id: 'motivo', label: 'Motivo (ej: Rendimiento académico)', placeholder: '[[MOTIVO]]', tipo: 'area_texto' }
        ]
    },
    {
        nombre: 'FICHA DE JUSTIFICACIÓN DE FALTAS',
        campos: definicionJustificacionFaltas
    }
];

async function poblar() {
    try {
        console.log('🚀 Sincronizando definiciones del asistente con la base de datos...');
        for (const f of formatosConfig) {
            const res = await pool.query(
                'UPDATE formatos SET campos_json = $1 WHERE nombre = $2 RETURNING id',
                [JSON.stringify(f.campos), f.nombre]
            );
            if (res.rowCount === 0) {
                console.warn(`⚠️ No se encontró formato con nombre exacto: "${f.nombre}"`);
            } else {
                console.log(`✅ "${f.nombre}" (id ${res.rows[0].id}) actualizado.`);
            }
        }
        console.log('🏁 Listo.');
    } catch (e) {
        console.error('❌ Error:', e);
    } finally {
        process.exit();
    }
}

poblar();
