/**
 * =============================================
 * LÓGICA DE GESTIÓN DE ESTUDIANTES
 * =============================================
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log("👥 Módulo de Estudiantes Listo");
    cargarEstudiantes();

    // Escuchar el cambio en el input de archivo para subir el Excel
    const excelInput = document.getElementById('input-excel');
    excelInput.addEventListener('change', (e) => {
        const archivo = e.target.files[0];
        if (archivo) {
            subirExcel(archivo);
        }
    });
});

/**
 * Obtiene la lista de estudiantes desde la base de datos de Neon
 */
async function cargarEstudiantes() {
    try {
        const respuesta = await fetch('/bienestar/api/estudiantes');
        const data = await respuesta.json();

        if (data.exito) {
            renderizarTabla(data.datos);
        }
    } catch (error) {
        console.error("❌ Error al cargar estudiantes:", error);
    }
}

/**
 * Dibuja los estudiantes en la tabla HTML
 */
function renderizarTabla(estudiantes) {
    const tbody = document.getElementById('tabla-estudiantes-body');
    
    if (estudiantes.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 40px; color: #94a3b8;">
                    <i class="fa-solid fa-folder-open" style="font-size: 2rem; display: block; margin-bottom: 10px;"></i>
                    Aún no hay alumnos registrados. ¡Importa tu primer Excel!
                </td>
            </tr>`;
        return;
    }

    tbody.innerHTML = estudiantes.map(est => `
        <tr>
            <td><strong>${est.cedula}</strong></td>
            <td>${est.nombres}</td>
            <td>${est.apellidos}</td>
            <td>${est.telefono || 'N/A'}</td>
            <td>${est.correo_institucional}</td>
            <td>
                <button class="btn-icon" title="Ver Expediente" style="border:none; background:none; color:#3b82f6; cursor:pointer; margin-right:10px;">
                    <i class="fa-solid fa-eye"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

/**
 * Envía el archivo Excel al servidor para su procesamiento
 */
async function subirExcel(archivo) {
    // Mostrar mensaje de carga
    const btn = document.querySelector('.btn-excel');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Procesando...';
    btn.disabled = true;

    const formData = new FormData();
    formData.append('excel', archivo);

    try {
        const respuesta = await fetch('/bienestar/api/estudiantes/cargar-excel', {
            method: 'POST',
            body: formData
        });

        const resultado = await respuesta.json();

        if (resultado.exito) {
            alert(`✅ ¡Éxito! Se cargaron ${resultado.contador} estudiantes correctamente.`);
            cargarEstudiantes(); // Recargar la tabla
        } else {
            alert(`❌ Error: ${resultado.mensaje}`);
        }
    } catch (error) {
        console.error("❌ Error en la subida:", error);
        alert("Ocurrió un error al procesar el archivo.");
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
        document.getElementById('input-excel').value = ''; // Resetear input
    }
}
