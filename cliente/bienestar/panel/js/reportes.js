/**
 * =============================================
 * reportes.js — Lógica para el Dashboard Analítico
 * =============================================
 */

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Verificar sesión (auth.js ya hace esto, pero por si acaso)
    await cargarEstadisticas();
});

async function cargarEstadisticas() {
    try {
        const respuesta = await fetch('/bienestar/api/reportes/estadisticas');
        const data = await respuesta.json();

        if (data.exito) {
            const { totalEstudiantes, totalFormatos, alertas, recientes } = data.datos;

            // 1. Llenar tarjetas superiores
            document.getElementById('stat-estudiantes').textContent = totalEstudiantes;
            document.getElementById('stat-alertas').textContent = alertas.total;
            document.getElementById('stat-resueltas').textContent = alertas.resueltas;
            document.getElementById('stat-formatos').textContent = totalFormatos;

            // 2. Dibujar Gráfico de Alertas (Chart.js)
            inicializarGraficoAlertas(alertas);

            // 3. Llenar tabla de actividad reciente
            llenarTablaRecientes(recientes);
        }
    } catch (error) {
        console.error('Error al cargar estadísticas:', error);
    }
}

function inicializarGraficoAlertas(stats) {
    const ctx = document.getElementById('chartAlertas').getContext('2d');
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Pendientes', 'En Proceso', 'Resueltas'],
            datasets: [{
                data: [stats.pendientes, stats.en_proceso, stats.resueltas],
                backgroundColor: ['#ef4444', '#f59e0b', '#10b981'],
                hoverOffset: 4,
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        padding: 20
                    }
                }
            },
            cutout: '70%'
        }
    });
}

function llenarTablaRecientes(lista) {
    const tbody = document.getElementById('lista-recientes');
    tbody.innerHTML = '';

    if (lista.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No hay alertas recientes</td></tr>';
        return;
    }

    lista.forEach(alerta => {
        const fecha = new Date(alerta.creado_en).toLocaleDateString();
        const badgeClass = alerta.estado === 'Pendiente' ? 'badge-pend' : (alerta.estado === 'En Proceso' ? 'badge-proc' : 'badge-resu');
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${alerta.apellidos} ${alerta.nombres}</strong></td>
            <td>${alerta.motivo}</td>
            <td><span class="badge ${badgeClass}">${alerta.estado}</span></td>
            <td>${fecha}</td>
        `;
        tbody.appendChild(tr);
    });
}
