const fs = require('fs');
const path = require('path');
const PizZip = require('pizzip');

const storageDir = path.join(__dirname, 'almacenamiento');

function repararArchivoDelimitadores(nombreArchivo, mapeoTags) {
    try {
        const ruta = path.join(storageDir, nombreArchivo);
        if (!fs.existsSync(ruta)) return;

        const content = fs.readFileSync(ruta);
        const zip = new PizZip(content);
        let xml = zip.file('word/document.xml').asText();

        // PASO 1: REMOCIÓN TOTAL DE LLAVES (Limpiar basura)
        xml = xml.replace(/<w:t[^>]*>[\{\}\s]*<\/w:t>/g, "");
        xml = xml.replace(/\{/g, "").replace(/\}/g, "");

        // PASO 2: INYECCIÓN CON NUEVOS DELIMITADORES [[ ]]
        Object.keys(mapeoTags).forEach(textoOriginal => {
            const tag = mapeoTags[textoOriginal];
            const nuevoTag = tag.replace(/\{\{/g, '[[').replace(/\}\}/g, ']]');
            if (xml.includes(textoOriginal)) {
                xml = xml.replace(textoOriginal, `${textoOriginal} ${nuevoTag}`);
            }
        });

        zip.file('word/document.xml', xml);
        const buf = zip.generate({ type: 'nodebuffer' });
        fs.writeFileSync(ruta, buf);
        console.log(`✅ [${nombreArchivo}] LIMPIEZA ATÓMICA COMPLETADA.`);
        
    } catch (e) {
        console.error(`❌ Error rescatando ${nombreArchivo}:`, e.message);
    }
}

// Mapeos
const mapping1 = {
    'Nombres:': '{{NOMBRE}}',
    'Apellidos:': '{{APELLIDO}}',
    'Carrera:': '{{CARRERA}}',
    'Semestre:': '{{SEMESTRE}}',
    'Contacto Estudiante:': '{{CONTACTO}}',
    'Fecha emisión:': '{{FECHA_EMISION}}',
    'Inasistenciasx': '{{SITUACION}}',
    'DETALLE LA DIFICULTAD IDENTIFICADA': '{{DETALLE}}',
    'RESOLUCION': '{{RESOLUCION}}',
    'REMISION A DEPARTAMENTO MÉDICO': '{{REMISION}}'
};

const mapping2 = {
    'Quito,': '{{FECHA}}',
    '(nombres completos del estudiante…..)': '{{NOMBRE}}',
    '(CI…)': '{{CEDULA}}',
    'carrera de (Nombre de la Carrera Ej. Tecnología Superior en Mecánica automotriz, o Tecnología Superior en Desarrollo de Software)': '{{CARRERA}}',
    'por motivo (escribir el motivo Ejemplo(rendimiento académico, ayuda económica, etc…..)': '{{MOTIVO}}'
};

repararArchivoDelimitadores('documento-1774330150650-64571289.docx', mapping1);
repararArchivoDelimitadores('documento-1774330098300-721488074.docx', mapping2);

console.log('🏁 Fin de reparación atómica.');
