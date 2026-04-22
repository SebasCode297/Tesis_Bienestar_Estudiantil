/**
 * Uso: node extraer_etiquetas_justificacion.js
 * Lee el .docx vinculado a FICHA DE JUSTIFICACIÓN DE FALTAS y lista etiquetas [[ ]]
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const PizZip = require('pizzip');
const pool = require('./config/baseDatos');

async function main() {
    const res = await pool.query(
        `SELECT id, nombre, archivo_ruta, archivo_nombre FROM formatos 
         WHERE nombre ILIKE '%JUSTIFICACI%FALTAS%' OR nombre ILIKE '%JUSTIFICACIÓN DE FALTAS%' 
         LIMIT 1`
    );
    if (!res.rows.length) {
        console.error('No se encontró el formato en la base de datos.');
        process.exit(1);
    }
    const row = res.rows[0];
    console.log('Formato:', row.nombre, 'id=', row.id);
    console.log('Archivo:', row.archivo_ruta);
    if (!row.archivo_ruta) {
        console.error('No hay archivo_ruta en la BD.');
        process.exit(1);
    }
    const abs = path.join(__dirname, 'almacenamiento', row.archivo_ruta);
    if (!fs.existsSync(abs)) {
        console.error('No existe el archivo:', abs);
        process.exit(1);
    }
    const zip = new PizZip(fs.readFileSync(abs));
    const xml = zip.files['word/document.xml'].asText();
    const matches = [...xml.matchAll(/\[\[([^\]]+)\]\]/g)].map(m => m[1].trim());
    const uniq = [...new Set(matches)];
    console.log('\nEtiquetas [[...]] encontradas (' + uniq.length + '):');
    uniq.sort().forEach((t, i) => console.log((i + 1) + '.', '[[' + t + ']]'));
    await pool.end();
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
