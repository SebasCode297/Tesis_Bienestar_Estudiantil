/**
 * =============================================
 * CONFIGURACIÓN DE FORMATOS — LÓGICA
 * Dos módulos: Seguimiento Estudiantil (apoyo) y Becas (beca)
 * =============================================
 */

let quill = null;
let moduloActual = null;       // 'apoyo' | 'beca'
let formatoEditandoId = null;  // ID del formato en edición (null = nuevo)
let archivoWordPendiente = null;

// =============================================
// INICIO
// =============================================
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar editor Quill
    quill = new Quill('#editor-quill', {
        theme: 'snow',
        modules: {
            toolbar: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline'],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                [{ 'align': [] }],
                ['link'],
                ['clean']
            ]
        },
        placeholder: 'Escribe o edita el contenido del formato aquí...'
    });

    // Escuchar selección de archivo Word
    document.getElementById('input-word').addEventListener('change', (e) => {
        const archivo = e.target.files[0];
        if (archivo) {
            archivoWordPendiente = archivo;
            abrirModalNombre();
        }
    });
});

// =============================================
// NAVEGACIÓN ENTRE VISTAS
// =============================================
function abrirModulo(tipo) {
    moduloActual = tipo;
    const nombre = tipo === 'beca' ? 'Becas' : 'Seguimiento Estudiantil';

    document.getElementById('titulo-pagina').textContent = nombre;
    document.getElementById('subtitulo-pagina').textContent =
        tipo === 'beca' ? 'Formatos del módulo de Becas.' : 'Formatos del módulo de Seguimiento Estudiantil.';
    document.getElementById('modulo-titulo-lista').textContent = nombre;

    document.getElementById('vista-modulos').style.display = 'none';
    document.getElementById('vista-formatos').classList.add('visible');

    cargarFormatos(tipo);
}

function volverModulos() {
    moduloActual = null;
    document.getElementById('titulo-pagina').textContent = 'Configuración de Formatos';
    document.getElementById('subtitulo-pagina').textContent = 'Selecciona un módulo para gestionar sus formatos.';
    document.getElementById('vista-modulos').style.display = '';
    document.getElementById('vista-formatos').classList.remove('visible');
    document.getElementById('input-word').value = '';
}

// =============================================
// CARGAR FORMATOS DEL MÓDULO
// =============================================
async function cargarFormatos(tipo) {
    const tbody = document.getElementById('tabla-formatos-body');
    tbody.innerHTML = '<tr><td colspan="3" class="tabla-vacia">Cargando...</td></tr>';

    try {
        const respuesta = await fetch('/bienestar/api/formatos');
        const data = await respuesta.json();

        if (!data.exito) throw new Error(data.mensaje);

        // Filtrar por tipo del módulo actual
        const formatos = data.datos.filter(f => f.tipo === tipo);

        if (formatos.length === 0) {
            tbody.innerHTML = `<tr><td colspan="3" class="tabla-vacia">No hay formatos aún. Sube uno desde Word o crea uno nuevo.</td></tr>`;
            return;
        }

        tbody.innerHTML = formatos.map(f => {
            const fecha = new Date(f.creado_en).toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' });
            return `
            <tr>
                <td><strong>${f.nombre}</strong></td>
                <td>${fecha}</td>
                <td style="text-align:right;">
                    <button class="btn-editar" onclick="editarFormato(${f.id})">Editar</button>
                    <button class="btn-eliminar" onclick="eliminarFormato(${f.id}, '${f.nombre}')">Eliminar</button>
                </td>
            </tr>`;
        }).join('');

    } catch (error) {
        console.error('Error al cargar formatos:', error);
        tbody.innerHTML = `<tr><td colspan="3" class="tabla-vacia">Error al cargar los formatos.</td></tr>`;
    }
}

// =============================================
// MODAL NOMBRE (para subir Word)
// =============================================
function abrirModalNombre() {
    document.getElementById('modal-nombre').classList.add('visible');
    document.getElementById('modal-nombre-input').focus();
}

function cerrarModalNombre() {
    document.getElementById('modal-nombre').classList.remove('visible');
    document.getElementById('modal-nombre-input').value = '';
    archivoWordPendiente = null;
    document.getElementById('input-word').value = '';
}

async function confirmarSubida() {
    const nombre = document.getElementById('modal-nombre-input').value.trim();
    if (!nombre) { alert('Por favor escribe el nombre del formato.'); return; }

    const archivoParaSubir = archivoWordPendiente;
    cerrarModalNombre();
    await subirWord(archivoParaSubir, nombre);
}

// =============================================
// SUBIR WORD
// =============================================
async function subirWord(archivo, nombre) {
    const formData = new FormData();
    formData.append('word', archivo);
    formData.append('nombre', nombre);
    formData.append('tipo', moduloActual);

    try {
        const respuesta = await fetch('/bienestar/api/formatos/subir', { method: 'POST', body: formData });
        const resultado = await respuesta.json();

        if (resultado.exito) {
            alert(`✅ "${nombre}" cargado correctamente.`);
            cargarFormatos(moduloActual);
        } else {
            alert(`❌ Error: ${resultado.mensaje}`);
        }
    } catch (error) {
        console.error('Error al subir:', error);
        alert('❌ Error al procesar el archivo. Intenta de nuevo.');
    }
}

// =============================================
// CREAR FORMATO VACÍO (sin Word)
// =============================================
function crearFormatoVacio() {
    formatoEditandoId = null;
    document.getElementById('editor-nombre').value = '';
    quill.root.innerHTML = '';
    document.getElementById('editor-overlay').classList.add('visible');
    document.getElementById('editor-nombre').focus();
}

// =============================================
// EDITAR FORMATO EXISTENTE
// =============================================
async function editarFormato(id) {
    try {
        const respuesta = await fetch(`/bienestar/api/formatos/${id}`);
        const data = await respuesta.json();
        if (!data.exito) throw new Error(data.mensaje);

        formatoEditandoId = id;
        document.getElementById('editor-nombre').value = data.datos.nombre;
        quill.root.innerHTML = data.datos.contenido_html || '';
        document.getElementById('editor-overlay').classList.add('visible');
    } catch (error) {
        console.error('Error al cargar formato:', error);
        alert('Error al cargar el formato.');
    }
}

// =============================================
// GUARDAR FORMATO (crear o editar)
// =============================================
async function guardarFormato() {
    const nombre = document.getElementById('editor-nombre').value.trim();
    const html   = quill.root.innerHTML;

    if (!nombre) { alert('El nombre no puede estar vacío.'); return; }

    try {
        let respuesta;
        if (formatoEditandoId) {
            // Actualizar existente
            respuesta = await fetch(`/bienestar/api/formatos/${formatoEditandoId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre, tipo: moduloActual, contenido_html: html })
            });
        } else {
            // Crear nuevo vacío
            respuesta = await fetch('/bienestar/api/formatos/subir-vacio', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre, tipo: moduloActual, contenido_html: html })
            });
        }

        const resultado = await respuesta.json();
        if (resultado.exito) {
            cerrarEditor();
            cargarFormatos(moduloActual);
        } else {
            alert(`❌ Error: ${resultado.mensaje}`);
        }
    } catch (error) {
        console.error('Error al guardar:', error);
        alert('Error al guardar el formato.');
    }
}

// =============================================
// ELIMINAR FORMATO
// =============================================
async function eliminarFormato(id, nombre) {
    if (!confirm(`¿Eliminar "${nombre}"? Esta acción no se puede deshacer.`)) return;

    try {
        const respuesta = await fetch(`/bienestar/api/formatos/${id}`, { method: 'DELETE' });
        const resultado = await respuesta.json();
        if (resultado.exito) {
            cargarFormatos(moduloActual);
        } else {
            alert(`❌ Error: ${resultado.mensaje}`);
        }
    } catch (error) {
        console.error('Error al eliminar:', error);
    }
}

// =============================================
// CERRAR EDITOR
// =============================================
function cerrarEditor() {
    document.getElementById('editor-overlay').classList.remove('visible');
    formatoEditandoId = null;
}
