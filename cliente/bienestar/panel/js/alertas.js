/**
 * =============================================
 * alertas.js — Lógica para Gestión de Alertas
 * =============================================
 */

document.addEventListener('DOMContentLoaded', () => {
    cargarAlertas();
    configurarBuscadorEstudiantes();
    
    document.getElementById('form-alerta').addEventListener('submit', guardarAlerta);
});

async function cargarAlertas() {
    try {
        const res = await fetch('/bienestar/api/alertas');
        const data = await res.json();
        
        if (data.exito) {
            renderizarTabla(data.datos);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function renderizarTabla(alertas) {
    const tbody = document.getElementById('tbody-alertas');
    tbody.innerHTML = '';
    
    alertas.forEach(alerta => {
        const fecha = new Date(alerta.creado_en).toLocaleDateString();
        const tr = document.createElement('tr');
        
        const priorityClass = `priority-${alerta.prioridad.toLowerCase()}`;
        const statusClass = alerta.estado === 'Pendiente' ? 'status-pend' : (alerta.estado === 'En Proceso' ? 'status-proc' : 'status-resu');
        
        tr.innerHTML = `
            <td><strong>${alerta.apellidos} ${alerta.nombres}</strong><br><small>${alerta.cedula}</small></td>
            <td>${alerta.motivo}</td>
            <td><span class="badge ${priorityClass}">${alerta.prioridad}</span></td>
            <td><span class="badge ${statusClass}">${alerta.estado}</span></td>
            <td>${fecha}</td>
            <td>
                <select onchange="cambiarEstado(${alerta.id}, this.value)" style="padding: 5px; border-radius: 5px; border: 1px solid #ddd;">
                    <option value="Pendiente" ${alerta.estado === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
                    <option value="En Proceso" ${alerta.estado === 'En Proceso' ? 'selected' : ''}>En Proceso</option>
                    <option value="Resuelto" ${alerta.estado === 'Resuelto' ? 'selected' : ''}>Resuelto</option>
                </select>
                <button onclick="eliminarAlerta(${alerta.id})" style="color: #ef4444; border: none; background: none; cursor: pointer; margin-left: 10px; font-weight: 600;">Eliminar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Lógica para buscar estudiantes en el modal
function configurarBuscadorEstudiantes() {
    const input = document.getElementById('search-estudiante');
    const resultsBox = document.getElementById('results-box');
    const idInput = document.getElementById('estudiante-id');
    
    input.addEventListener('input', async (e) => {
        const query = e.target.value;
        if (query.length < 2) {
            resultsBox.style.display = 'none';
            return;
        }
        
        try {
            const res = await fetch(`/bienestar/api/estudiantes/buscar?q=${query}`);
            const data = await res.json();
            
            if (data.exito && data.datos.length > 0) {
                resultsBox.innerHTML = '';
                data.datos.forEach(est => {
                    const div = document.createElement('div');
                    div.className = 'result-item';
                    div.textContent = `${est.apellidos} ${est.nombres} (${est.cedula})`;
                    div.onclick = () => {
                        input.value = `${est.apellidos} ${est.nombres}`;
                        idInput.value = est.id;
                        resultsBox.style.display = 'none';
                    };
                    resultsBox.appendChild(div);
                });
                resultsBox.style.display = 'block';
            } else {
                resultsBox.style.display = 'none';
            }
        } catch (error) {
            console.error('Error buscando estudiantes:', error);
        }
    });
}

async function guardarAlerta(e) {
    e.preventDefault();
    
    const datos = {
        estudiante_id: document.getElementById('estudiante-id').value,
        motivo: document.getElementById('motivo-alerta').value,
        prioridad: document.getElementById('prioridad-alerta').value,
        descripcion: document.getElementById('descripcion-alerta').value
    };
    
    if (!datos.estudiante_id) {
        alert('Debes seleccionar un estudiante de la lista.');
        return;
    }
    
    try {
        const res = await fetch('/bienestar/api/alertas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });
        
        if (res.ok) {
            cerrarModal();
            cargarAlertas();
            document.getElementById('form-alerta').reset();
        }
    } catch (error) {
        console.error('Error guardando alerta:', error);
    }
}

async function cambiarEstado(id, nuevoEstado) {
    try {
        await fetch(`/bienestar/api/alertas/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado: nuevoEstado })
        });
        cargarAlertas();
    } catch (error) {
        console.error('Error actualizando estado:', error);
    }
}

async function eliminarAlerta(id) {
    if (!confirm('¿Seguro que deseas eliminar esta alerta?')) return;
    
    try {
        await fetch(`/bienestar/api/alertas/${id}`, { method: 'DELETE' });
        cargarAlertas();
    } catch (error) {
        console.error('Error eliminando alerta:', error);
    }
}

function abrirModal() { document.getElementById('modal-alerta').style.display = 'flex'; }
function cerrarModal() { document.getElementById('modal-alerta').style.display = 'none'; }
