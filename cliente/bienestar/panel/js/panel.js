/**
 * =============================================
 * LÓGICA DEL DASHBOARD DE BIENESTAR
 * =============================================
 */

document.addEventListener('DOMContentLoaded', () => {
    const dateBox = document.getElementById('current-date');
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateBox.innerText = new Date().toLocaleDateString('es-ES', options);

    cargarEstadisticas();
});

async function cargarEstadisticas() {
    const container = document.getElementById('lista-alertas-recientes');
    try {
        const respuesta = await fetch('/bienestar/api/reportes/estadisticas');
        const data = await respuesta.json();

        if (data.exito) {
            const { totalEstudiantes, alertas, recientes } = data.datos;
            
            // Actualizar contadores
            animarValor('stat-total-alumnos', totalEstudiantes || 0);
            animarValor('stat-alertas-criticas', (alertas ? alertas.pendientes : 0));
            animarValor('stat-casos-resueltos', (alertas ? alertas.resueltas : 0));
            animarValor('stat-en-proceso', (alertas ? alertas.en_proceso : 0));

            // Limpiar y llenar lista de alertas
            if (container) {
                if (recientes && recientes.length > 0) {
                    container.innerHTML = '';
                    recientes.forEach(alerta => {
                        const item = document.createElement('div');
                        item.style = "padding: 15px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center;";
                        item.innerHTML = `
                            <div>
                                <strong>${alerta.apellidos} ${alerta.nombres}</strong><br>
                                <small style="color: #64748b;">${alerta.motivo}</small>
                            </div>
                            <span style="font-size: 0.8rem; font-weight: 700; color: ${alerta.estado === 'Pendiente' ? '#ef4444' : '#f59e0b'};">${alerta.estado}</span>
                        `;
                        container.appendChild(item);
                    });
                } else {
                    container.innerHTML = '<p style="color: #94a3b8; text-align: center; padding: 20px;">No hay alertas registradas aún.</p>';
                }
            }
        }
    } catch (error) {
        console.error("❌ Error al cargar estadísticas:", error);
        if (container) container.innerHTML = '<p style="color: #ef4444; text-align: center; padding: 20px;">Error al conectar con el servidor.</p>';
    }
}

function animarValor(id, valorFinal) {
    const obj = document.getElementById(id);
    if(!obj) return;
    let inicio = 0;
    const duracion = 1000;
    const incremento = valorFinal / (duracion / 10);
    
    const timer = setInterval(() => {
        inicio += incremento;
        if (inicio >= valorFinal) {
            obj.innerText = valorFinal;
            clearInterval(timer);
        } else {
            obj.innerText = Math.floor(inicio);
        }
    }, 10);
}
