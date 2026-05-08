// =============================================
// reportes.js — Lógica del módulo de Reportes e Indicadores
// Carga estadísticas desde la API y las muestra en pantalla
// =============================================

document.addEventListener('DOMContentLoaded', cargarReportes);

async function cargarReportes() {
    try {
        const res = await fetch('/bienestar/api/reportes/estadisticas');
        const data = await res.json();

        if (!data.exito) {
            console.error('Error en datos:', data.mensaje);
            return;
        }

        const d = data.datos;

        // Actualizar tarjetas de estadísticas
        document.getElementById('stat-estudiantes').innerText = d.totalEstudiantes || 0;
        document.getElementById('stat-alertas').innerText     = d.alertas ? d.alertas.total : 0;
        document.getElementById('stat-resueltas').innerText   = d.alertas ? d.alertas.resueltas : 0;
        document.getElementById('stat-formatos').innerText    = d.totalFormatos || 0;

        // Llenar tabla de casos recientes
        const tbody = document.getElementById('lista-recientes');
        if (d.recientes && d.recientes.length > 0) {
            tbody.innerHTML = '';
            d.recientes.forEach(caso => {
                const badgeClass = caso.estado === 'Pendiente' ? 'badge-pend'
                                 : caso.estado === 'En Proceso' ? 'badge-proc' : 'badge-resu';
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>${caso.apellidos} ${caso.nombres}</strong></td>
                    <td>${caso.motivo}</td>
                    <td><span class="badge ${badgeClass}">${caso.estado}</span></td>
                    <td>${new Date(caso.creado_en).toLocaleDateString('es-ES')}</td>
                `;
                tbody.appendChild(tr);
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:30px; color:#94a3b8;">No hay casos registrados aún.</td></tr>';
        }

        // Gráfico de Estado de Gestión
        const ctx = document.getElementById('chartAlertas');
        if (ctx && d.alertas) {
            new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Pendientes', 'En Proceso', 'Resueltos'],
                    datasets: [{
                        data: [
                            d.alertas.pendientes || 0,
                            d.alertas.en_proceso || 0,
                            d.alertas.resueltas  || 0
                        ],
                        backgroundColor: ['#fee2e2', '#fef3c7', '#dcfce7'],
                        borderColor:     ['#b91c1c', '#b45309', '#15803d'],
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'bottom' }
                    }
                }
            });
        }

    } catch (error) {
        console.error('Error al cargar reportes:', error);
    }
}
