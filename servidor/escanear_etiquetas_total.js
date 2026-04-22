const fs = require('fs');
const path = require('path');
const PizZip = require('pizzip');

const storageDir = path.join(__dirname, 'almacenamiento');
const files = fs.readdirSync(storageDir).filter(f => f.endsWith('.docx'));

const results = {};

files.forEach(file => {
    try {
        const buffer = fs.readFileSync(path.join(storageDir, file));
        const zip = new PizZip(buffer);
        const xml = zip.file('word/document.xml').asText();
        
        // Unir fragmentos de texto: Word separa {{TAG}} en <w:t>{</w:t><w:t>{</w:t><w:t>TAG</w:t>...
        // La mejor forma es extraer todos los w:t y concatenarlos, pero se pierde el orden por párrafo.
        // Usaremos una técnica de limpieza de "ruido" XML entre las llaves.
        
        // 1. Buscamos el contenido entre <w:t> y </w:t>
        const matchesText = xml.match(/<w:t[^>]*>(.*?)<\/w:t>/g);
        if (!matchesText) {
            results[file] = [];
            return;
        }

        const fullText = matchesText.map(t => t.replace(/<[^>]+>/g, "")).join("");
        
        // 2. Ahora buscamos {{...}} en el texto plano reconstruido
        const tags = fullText.match(/\{\{[^}]+\}\}/g);
        
        if (tags) {
            results[file] = [...new Set(tags)];
        } else {
            results[file] = [];
        }
    } catch (e) {
        results[file] = { error: e.message };
    }
});

console.log(JSON.stringify(results, null, 2));
