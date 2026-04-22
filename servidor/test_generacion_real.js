const { Pool } = require('pg');
const pool = new Pool({ host: 'localhost', user: 'postgres', password: '1234', database: 'bienestar_estudiantil', port: 5432 });
const path = require('path');
const fs = require('fs');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');

async function test() {
    try {
        console.log('--- TEST DE GENERACIÓN ---');
        // Usar la última asignación creada
        const res = await pool.query('SELECT ef.id, f.archivo_ruta FROM estudiante_formatos ef JOIN formatos f ON ef.formato_id = f.id ORDER BY ef.asignado_en DESC LIMIT 1');
        const asignacion = res.rows[0];
        
        if (!asignacion) {
            console.error('No hay asignaciones para probar.');
            return;
        }
        
        console.log('Probando con asignación ID:', asignacion.id);
        console.log('Plantilla:', asignacion.archivo_ruta);

        const rutaPlantilla = path.join(__dirname, 'almacenamiento', asignacion.archivo_ruta);
        const content = fs.readFileSync(rutaPlantilla, 'binary');
        const zip = new PizZip(content);
        
        // Aquí suele fallar si el XML está roto. Usamos [[ ]] 
        const doc = new Docxtemplater(zip, { 
            paragraphLoop: true, 
            linebreaks: true,
            delimiters: { start: '[[', end: ']]' }
        });

        const datos = {
            NOMBRE: 'TEST FINAL',
            APELLIDO: 'TEST FINAL',
            RESOLUCION: 'DATO PRUEBA EXITOSO'
        };

        console.log('Intentando renderizar con [[ ]]...');
        doc.render(datos);

        console.log('Generando buffer...');
        const buf = doc.getZip().generate({ type: 'nodebuffer', compression: 'DEFLATE' });

        console.log('Intentando guardar bitácora...');
        await pool.query(
            'UPDATE estudiante_formatos SET respuestas_json = $1, finalizado_en = CURRENT_TIMESTAMP WHERE id = $2',
            [JSON.stringify(datos), asignacion.id]
        );

        console.log('✅ TEST EXITOSO CON [[ ]]. El motor funciona perfectamente.');
    } catch (e) {
        console.error('❌ ERROR DETECTADO:', e);
        if (e.properties && e.properties.errors) {
            console.error('Detalles de Docxtemplater:', JSON.stringify(e.properties.errors, null, 2));
        }
    } finally {
        process.exit();
    }
}

test();
