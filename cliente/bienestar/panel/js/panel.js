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
    try {
        const respuesta = await fetch('/bienestar/api/reportes/estadisticas');
        const data = await respuesta.json();

        if (data.exito) {
            const { totalEstudiantes, alertas, recientes } = data.datos;
            animarValor('stat-total-alumnos', totalEstudiantes);
            animarValor('stat-alertas-criticas', alertas.pendientes || 0);
            animarValor('stat-casos-resueltos', alertas.resueltas || 0);
            animarValor('stat-en-proceso', alertas.en_proceso || 0);

            // Mostrar alertas recientes
            const container = document.getElementById('lista-alertas-recientes');
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
    } catch (error) {
        console.error("❌ Error al cargar estadísticas:", error);
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
