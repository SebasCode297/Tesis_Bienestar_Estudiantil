const fs = require('fs');
const path = require('path');
const PizZip = require('pizzip');

const storageDir = path.join(__dirname, 'almacenamiento');

/**
 * Función de Rescate Idempotente:
 * 1. Limpieza radical de llaves y corchetes (Purga).
 * 2. Inyección UNICA por label (Sin duplicar nunca).
 */
function rescatarPlantilla(nombreArchivo, mapeoTags) {
    try {
        const ruta = path.join(storageDir, nombreArchivo);
        if (!fs.existsSync(ruta)) return;

        const content = fs.readFileSync(ruta);
        const zip = new PizZip(content);
        let xml = zip.file('word/document.xml').asText();

        // PASO 1: PURGA RADICAL (Limpieza profunda)
        // Borramos cualquier corchete o llave individual, lo que mata etiquetas rotas
        xml = xml.replace(/[{}|[\]]/g, "");
        // Borramos los posibles tags que quedaron entre etiquetas (purga de ruido)
        // Eliminamos "NOMBRE", "CARRERA", etc. si quedaron pegados sin corchetes
        // (Solo si son los tags técnicos conocidos)
        Object.values(mapeoTags).forEach(tag => {
            const regex = new RegExp(tag, 'g');
            xml = xml.replace(regex, "");
        });

        // PASO 2: INYECCIÓN IDEMPOTENTE (Solo una vez)
        Object.keys(mapeoTags).forEach(label => {
            const tag = `[[${mapeoTags[label]}]]`;
            
            // Si el label existe en el documento
            if (xml.includes(label)) {
                // REEMPLAZO UNICO: Usamos replace sin la bandera 'g' para que solo actúe una vez.
                // Además, verificamos que no tenga ya el tag al lado (seguridad extra)
                if (!xml.includes(`${label} ${tag}`)) {
                    xml = xml.replace(label, `${label} ${tag}`);
                }
            }
        });

        zip.file('word/document.xml', xml);
        const buf = zip.generate({ type: 'nodebuffer' });
        fs.writeFileSync(ruta, buf);
        console.log(`🏥 [${nombreArchivo}] RESCATE COMPLETADO (IDEMPOTENTE).`);
        
    } catch (e) {
        console.error(`❌ Error rescatando ${nombreArchivo}:`, e.message);
    }
}

// Mapeos definitivos (ISTPET)
const mapping7 = {
    'Nombres:': 'NOMBRE',
    'Apellidos:': 'APELLIDO',
    'Carrera:': 'CARRERA',
    'Semestre:': 'SEMESTRE',
    'Contacto Estudiante:': 'CONTACTO',
    'Fecha emisión:': 'FECHA_EMISION',
    'Inasistenciasx': 'SITUACION',
    'DETALLE LA DIFICULTAD IDENTIFICADA': 'DETALLE',
    'RESOLUCION': 'RESOLUCION',
    'REMISION A DEPARTAMENTO MÉDICO': 'REMISION'
};

const mapping1 = {
    'Quito,': 'FECHA',
    '(nombres completos del estudiante…..)': 'NOMBRE',
    '(CI…)': 'CEDULA',
    'carrera de (Nombre de la Carrera Ej. Tecnología Superior en Mecánica automotriz, o Tecnología Superior en Desarrollo de Software)': 'CARRERA',
    'por motivo (escribir el motivo Ejemplo(rendimiento académico, ayuda económica, etc…..)': 'MOTIVO'
};

rescatarPlantilla('documento-1774330150650-64571289.docx', mapping7);
rescatarPlantilla('documento-1774330098300-721488074.docx', mapping1);

console.log('🏁 Rescate finalizado. Plantillas puras y listas.');
