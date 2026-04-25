/**
 * =============================================
 * LÓGICA DE CONFIGURACIÓN DE FORMATOS
 * =============================================
 */

let quill = null;
let formatoActualId = null;
let archivoWordPendiente = null;

// Inicializa el editor y carga los formatos al cargar la página
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
                ['link', 'image'],
                ['clean']
            ]
        },
        placeholder: 'El contenido del formato aparecerá aquí...'
    });

    // Escuchar selección de archivo Word
    document.getElementById('input-word').addEventListener('change', (e) => {
        const archivo = e.target.files[0];
        if (archivo) {
            archivoWordPendiente = archivo;
            abrirModal();
        }
    });

    // Cargar formatos existentes
    cargarFormatos();
});

// =============================================
// MODAL — Pedir nombre antes de subir
// =============================================
function abrirModal() {
    document.getElementById('modal-nombre').style.display = 'flex';
    document.getElementById('modal-nombre-input').focus();
}

function cerrarModal() {
    document.getElementById('modal-nombre').style.display = 'none';
    document.getElementById('modal-nombre-input').value = '';
    archivoWordPendiente = null;
    document.getElementById('input-word').value = '';
}

async function confirmarSubida() {
    const nombre = document.getElementById('modal-nombre-input').value.trim();
    const tipo   = document.getElementById('modal-tipo-select').value;

    if (!nombre) {
        alert('Por favor escribe el nombre del formato.');
        return;
    }

    // Guardar referencia ANTES de cerrar el modal (cerrarModal pone archivoWordPendiente en null)
    const archivoParaSubir = archivoWordPendiente;
    cerrarModal();
    await subirWord(archivoParaSubir, nombre, tipo);
}

// =============================================
// SUBIDA DE WORD
// =============================================
async function subirWord(archivo, nombre, tipo) {
    const formData = new FormData();
    formData.append('word', archivo);
    formData.append('nombre', nombre);
    formData.append('tipo', tipo);

    try {
        const respuesta = await fetch('/bienestar/api/formatos/subir', {
            method: 'POST',
            body: formData
        });
        const resultado = await respuesta.json();

        if (resultado.exito) {
            alert(`✅ ${resultado.mensaje}`);
            await cargarFormatos();
            // Abrir el formato recién subido en el editor
            abrirEnEditor(resultado.datos);
        } else {
            alert(`❌ Error: ${resultado.mensaje}`);
        }
    } catch (error) {
        console.error('Error al subir:', error);
        alert('❌ Error al procesar el archivo. Intenta de nuevo.');
    }
}

// =============================================
// CARGAR LISTA DE FORMATOS
// =============================================
async function cargarFormatos() {
    try {
        const respuesta = await fetch('/bienestar/api/formatos');
        const data = await respuesta.json();

        if (data.exito) {
            renderizarLista(data.datos);
        }
    } catch (error) {
        console.error('Error al cargar formatos:', error);
    }
}

function renderizarLista(formatos) {
    const contenedor = document.getElementById('lista-formatos');
    const contador   = document.getElementById('contador-formatos');
    contador.textContent = `${formatos.length} formato${formatos.length !== 1 ? 's' : ''}`;

    if (formatos.length === 0) {
        contenedor.innerHTML = `
            <div class="formatos-vacio">
                Sube tu primer formato Word para empezar
            </div>`;
        return;
    }

    contenedor.innerHTML = formatos.map(f => `
        <div class="formato-item ${f.id === formatoActualId ? 'activo' : ''}" 
             onclick="seleccionarFormato(${f.id})" data-id="${f.id}">
            <div class="formato-item-info">
                <div class="formato-item-nombre">${f.nombre}</div>
                <div class="formato-item-tipo">${f.tipo === 'beca' ? 'Becas' : 'Apoyo Estudiantil'}</div>
            </div>
            <button class="formato-item-del" onclick="eliminarFormato(event, ${f.id}, '${f.nombre}')" title="Eliminar">
                Eliminar
            </button>
        </div>
    `).join('');
}

// =============================================
// SELECCIONAR FORMATO — carga en editor
// =============================================
async function seleccionarFormato(id) {
    try {
        const respuesta = await fetch(`/bienestar/api/formatos/${id}`);
        const data = await respuesta.json();

        if (data.exito) {
            abrirEnEditor(data.datos);
        }
    } catch (error) {
        console.error('Error al obtener formato:', error);
    }
}

function abrirEnEditor(formato) {
    formatoActualId = formato.id;

    // Actualizar lista visual (marcar como activo)
    document.querySelectorAll('.formato-item').forEach(el => {
        el.classList.toggle('activo', parseInt(el.dataset.id) === formato.id);
    });

    // Mostrar panel editor
    document.getElementById('editor-empty').style.display = 'none';
    const editorContenido = document.getElementById('editor-contenido');
    editorContenido.style.display = 'flex';

    // Llenar datos
    document.getElementById('editor-nombre').value = formato.nombre;
    document.getElementById('editor-tipo').value   = formato.tipo;

    // Cargar HTML en Quill
    quill.root.innerHTML = formato.contenido_html || '';
}

// =============================================
// GUARDAR EDICIÓN
// =============================================
async function guardarFormato() {
    if (!formatoActualId) return;

    const nombre = document.getElementById('editor-nombre').value.trim();
    const tipo   = document.getElementById('editor-tipo').value;
    const html   = quill.root.innerHTML;

    if (!nombre) { alert('El nombre no puede estar vacío.'); return; }

    try {
        const respuesta = await fetch(`/bienestar/api/formatos/${formatoActualId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, tipo, contenido_html: html })
        });
        const resultado = await respuesta.json();

        if (resultado.exito) {
            alert('✅ Formato guardado correctamente.');
            cargarFormatos();
        } else {
            alert(`❌ Error: ${resultado.mensaje}`);
        }
    } catch (error) {
        console.error('Error al guardar:', error);
        alert('❌ Error al guardar. Intenta de nuevo.');
    }
}

// =============================================
// ELIMINAR FORMATO
// =============================================
async function eliminarFormato(event, id, nombre) {
    event.stopPropagation();
    if (!confirm(`¿Seguro que quieres eliminar "${nombre}"? Esta acción no se puede deshacer.`)) return;

    try {
        const respuesta = await fetch(`/bienestar/api/formatos/${id}`, { method: 'DELETE' });
        const resultado = await respuesta.json();

        if (resultado.exito) {
            if (formatoActualId === id) {
                formatoActualId = null;
                document.getElementById('editor-empty').style.display = 'flex';
                document.getElementById('editor-contenido').style.display = 'none';
            }
            cargarFormatos();
        } else {
            alert(`❌ Error: ${resultado.mensaje}`);
        }
    } catch (error) {
        console.error('Error al eliminar:', error);
    }
}
