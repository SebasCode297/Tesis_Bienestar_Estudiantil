const pool = require('./config/baseDatos');

const camposActa = [
    { id: "nombre_apellido", label: "Nombres y Apellidos", placeholder: "{{NOMBRE_APELLIDO}}", tipo: "texto" },
    { id: "cedula", label: "Cédula de Identidad", placeholder: "{{CEDULA}}", tipo: "texto" },
    { id: "carrera", label: "Carrera", placeholder: "{{CARRERA}}", tipo: "texto" },
    { id: "semestre", label: "Semestre", placeholder: "{{SEMESTRE}}", tipo: "texto" },
    { id: "direccion", label: "Dirección Domiciliaria", placeholder: "{{DIRECCION}}", tipo: "texto" },
    { id: "contacto", label: "Número de contacto", placeholder: "{{CONTACTO}}", tipo: "texto" },
    { id: "correo", label: "Correo electrónico", placeholder: "{{CORREO}}", tipo: "texto" },
    { id: "periodo", label: "Periodo Académico", placeholder: "{{PERIODO}}", tipo: "texto" },
    { id: "dificultad", label: "Dificultad Identificada", placeholder: "{{DIFICULTAD}}", tipo: "texto" },
    { id: "acuerdos", label: "Acuerdo y Compromiso", placeholder: "{{ACUERDOS}}", tipo: "area_texto" },
    { id: "plazo", label: "Plazo de cumplimiento", placeholder: "{{PLAZO}}", tipo: "texto" }
];

async function poblar() {
    try {
        const res = await pool.query(
            "UPDATE formatos SET campos_json = $1 WHERE nombre ILIKE '%Acuerdo%' OR nombre ILIKE '%Acta%' RETURNING id",
            [JSON.stringify(camposActa)]
        );
        console.log(`✅ Campos configurados en ${res.rowCount} formato(s).`);
    } catch (e) {
        console.error("❌ Error poblando campos:", e);
    } finally {
        process.exit();
    }
}

poblar();
