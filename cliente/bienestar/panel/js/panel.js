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
            const { totalEstudiantes, alertas } = data.datos;
            animarValor('stat-total-alumnos', totalEstudiantes);
            animarValor('stat-alertas-criticas', alertas.pendientes || 0);
            animarValor('stat-casos-resueltos', alertas.resueltas || 0);
            animarValor('stat-en-proceso', alertas.en_proceso || 0);
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
