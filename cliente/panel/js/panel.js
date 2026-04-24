/**
 * =============================================
 * LÓGICA DEL DASHBOARD DE BIENESTAR
 * =============================================
 * Este archivo maneja la interactividad y la carga de datos en tiempo real.
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log("🚀 Panel de Bienestar Inicializado");
    
    // 1. Mostrar la fecha actual de forma elegante
    const dateBox = document.getElementById('current-date');
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateBox.innerText = new Date().toLocaleDateString('es-ES', options);

    // 2. Cargar Estadísticas desde el Servidor
    cargarEstadisticas();
});

/**
 * Función que hace la petición al backend para obtener los números reales
 */
async function cargarEstadisticas() {
    try {
        // Llamamos a la API de reportes que creamos anteriormente
        const respuesta = await fetch('/bienestar/api/reportes/estadisticas');
        const data = await respuesta.json();

        if (data.exito) {
            const { totalEstudiantes, alertas } = data.datos;

            // Actualizamos los valores en la interfaz con animación de conteo
            animarValor('stat-total-alumnos', totalEstudiantes);
            animarValor('stat-alertas-criticas', alertas.pendientes || 0);
            animarValor('stat-casos-resueltos', alertas.resueltas || 0);
            animarValor('stat-en-proceso', alertas.en_proceso || 0);
            
            console.log("📊 Estadísticas cargadas con éxito");
        }
    } catch (error) {
        console.error("❌ Error al cargar estadísticas:", error);
    }
}

/**
 * Función estética para que los números suban poco a poco (Efecto contador)
 */
function animarValor(id, valorFinal) {
    const obj = document.getElementById(id);
    let inicio = 0;
    const duracion = 1000; // 1 segundo de animación
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
