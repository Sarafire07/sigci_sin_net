// =========================================================
// 1. NAVEGACIÓN DEL MENÚ LATERAL
// =========================================================
document.addEventListener("DOMContentLoaded", () => {
    const rutasMenu = {
        'btn-resumen': { vista: 'vista-resumen', titulo: 'Resumen General' },
        'btn-ventas': { vista: 'vista-ventas', titulo: 'Historial de Ventas' },
        'btn-rutas': { vista: 'vista-rutas', titulo: 'Gestión de Rutas' },
        'btn-buses': { vista: 'vista-buses', titulo: 'Administración de Flota' },
        'btn-personal': { vista: 'vista-personal', titulo: 'Personal'},
        'btn-reportes': { vista: 'vista-reportes', titulo: 'Reportes y Estadísticas' },
        'btn-alertas': { vista: 'vista-alertas', titulo: 'Centro de Alertas' },
        'btn-configuracion': { vista: 'vista-configuracion', titulo: 'Configuración' }
    };

    const botonesMenu = document.querySelectorAll('.menu li');
    const tituloSeccion = document.getElementById('titulo-seccion');

    botonesMenu.forEach(boton => {
        boton.addEventListener('click', function() {
            botonesMenu.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            document.querySelectorAll('.vista').forEach(vista => vista.style.display = 'none');

            const configuracionRuta = rutasMenu[this.id];
            if (configuracionRuta) {
                document.getElementById(configuracionRuta.vista).style.display = 'block';
                if (tituloSeccion) tituloSeccion.innerText = configuracionRuta.titulo;
            }
        });
    });

    cargarDatosVentas();
});

// =========================================================
// 2. CONEXIÓN A BD, TABLAS, KPIs Y GRÁFICO CIRCULAR
// =========================================================
let todasLasVentas = []; 
let graficoRutasInstance = null; 

async function cargarDatosVentas() {
    try {
        const respuesta = await fetch('https://sigci-sin-net.onrender.com/api/ventas');
        todasLasVentas = await respuesta.json();
        
        actualizarPanelPrincipal(todasLasVentas);
        renderizarTablaVentas(todasLasVentas);
    } catch (error) {
        console.error("Error conectando con la API:", error);
    }
}

function actualizarPanelPrincipal(datos) {
    let totalIngresos = 0;
    let totalBoletos = 0;
    let totalAlertas = 0;
    
    let ingresosOvalleSerena = 0;
    let ingresosSerenaOvalle = 0;
    let ingresosOtros = 0;

    const tablaResumen = document.getElementById('tabla-ventas');
    if (tablaResumen) tablaResumen.innerHTML = '';

    datos.forEach(venta => {
        totalIngresos += Number(venta.ingresos);
        totalBoletos += Number(venta.boletos);
        
        if(venta.estado !== 'Sincronizado') totalAlertas++;

        if(venta.ruta === 'Ovalle - La Serena') ingresosOvalleSerena += Number(venta.ingresos);
        else if(venta.ruta === 'La Serena - Ovalle') ingresosSerenaOvalle += Number(venta.ingresos);
        else ingresosOtros += Number(venta.ingresos);

        const claseEstado = venta.estado === 'Sincronizado' ? 'badge-ok' : 'badge-alert';

        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td><strong>${venta.bus}</strong></td>
            <td>${venta.ruta}</td>
            <td>${venta.turno}</td>
            <td>${venta.boletos}</td>
            <td><strong>$${Number(venta.ingresos).toLocaleString('es-CL')}</strong></td>
            <td><span class="badge ${claseEstado}">${venta.estado}</span></td>
        `;
        if (tablaResumen) tablaResumen.appendChild(fila);
    });

    let promedio = totalBoletos > 0 ? Math.round(totalIngresos / totalBoletos) : 0;

    if (document.getElementById('kpi-ingresos')) document.getElementById('kpi-ingresos').innerText = '$' + totalIngresos.toLocaleString('es-CL');
    if (document.getElementById('kpi-boletos')) document.getElementById('kpi-boletos').innerText = totalBoletos;
    if (document.getElementById('kpi-promedio')) document.getElementById('kpi-promedio').innerText = '$' + promedio.toLocaleString('es-CL');
    if (document.getElementById('kpi-alertas')) document.getElementById('kpi-alertas').innerText = totalAlertas;

    dibujarGraficoRutas(ingresosOvalleSerena, ingresosSerenaOvalle, ingresosOtros);
}

function dibujarGraficoRutas(ovalleSerena, serenaOvalle, otros) {
    const canvasDoughnut = document.getElementById('doughnutChart');
    if (!canvasDoughnut) return;

    if (graficoRutasInstance) graficoRutasInstance.destroy(); 

    const ctxDoughnut = canvasDoughnut.getContext('2d');
    graficoRutasInstance = new Chart(ctxDoughnut, {
      type: 'doughnut',
      data: {
        labels: ['Ovalle - La Serena', 'La Serena - Ovalle', 'Otros'],
        datasets: [{
          data: [ovalleSerena, serenaOvalle, otros],
          backgroundColor: ['#3182ce', '#38b2ac', '#4a5568']
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
}

function renderizarTablaVentas(datos) {
    const tablaVentas = document.getElementById('cuerpo-tabla');
    if (!tablaVentas) return;
    
    tablaVentas.innerHTML = ''; 
    let totalIngresosFiltro = 0;

    datos.forEach(venta => {
        totalIngresosFiltro += Number(venta.ingresos);

        const codigoMostrar = venta.codigo_venta ? venta.codigo_venta : '---';

        const fila = document.createElement('tr');
       fila.innerHTML = `
            <td style="padding: 10px; color: #2b6cb0; font-weight: bold;">${venta.codigo_venta}</td>
            <td style="padding: 10px;"><strong>${venta.nombre_vendedor || 'Sin asignar'}</strong></td>
            <td style="padding: 10px;"><strong>${venta.patente || venta.bus}</strong></td>
            <td style="padding: 10px;">${venta.ruta}</td>
            <td style="padding: 10px;">${venta.tipo_boleto || 'Adulto'}</td>
            <td style="padding: 10px;">${venta.hora || '--:--'}</td>
            <td style="padding: 10px;">${venta.boletos}</td>
            <td style="padding: 10px;"><strong>$${Number(venta.ingresos).toLocaleString('es-CL')}</strong></td>
            <td style="padding: 10px;">${venta.estado}</td>
`;
        tablaVentas.appendChild(fila);
    });

    const totalTabla = document.getElementById('total-tabla-ventas');
    if (totalTabla) totalTabla.innerText = '$' + totalIngresosFiltro.toLocaleString('es-CL');
}

function aplicarFiltros() {
    const textoBus = document.getElementById('filtro-bus').value.toLowerCase();
    const textoRuta = document.getElementById('filtro-ruta').value;

    const ventasFiltradas = todasLasVentas.filter(venta => {
        const coincideBus = venta.bus.toLowerCase().includes(textoBus);
        const coincideRuta = textoRuta === "" || venta.ruta === textoRuta;
        return coincideBus && coincideRuta;
    });

    renderizarTablaVentas(ventasFiltradas); 
}

const filtroBus = document.getElementById('filtro-bus');
const filtroRuta = document.getElementById('filtro-ruta');
if (filtroBus && filtroRuta) {
    filtroBus.addEventListener('keyup', aplicarFiltros);
    filtroRuta.addEventListener('change', aplicarFiltros);
}

// =========================================================
// 3. GRÁFICO DE LÍNEAS ESTÁTICO (Placeholder)
// =========================================================
const canvasLine = document.getElementById('lineChart');
if (canvasLine) {
    const ctxLine = canvasLine.getContext('2d');
    new Chart(ctxLine, {
      type: 'line',
      data: {
        labels: ['Día 1', 'Día 2', 'Día 3', 'Día 4', 'Día 5', 'Día 6', 'Hoy'],
        datasets: [{
          label: 'Ingresos Históricos',
          data: [75000, 90000, 110000, 85000, 115000, 105000, 125000],
          borderColor: '#3182ce',
          tension: 0.3,
          fill: false
        }]
      },
      options: { 
        responsive: true, 
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true, 
            ticks: {
              callback: function(value) { return '$' + value.toLocaleString('es-CL'); }
            }
          }
        }
      }  
    });
}

// =========================================================
// 4. CARGA Y GUARDADO DE BUSES Y RUTAS
// =========================================================

async function cargarBuses() {
    try {
        const respuesta = await fetch('https://sigci-sin-net.onrender.com/api/buses');
        const buses = await respuesta.json();
        const tbody = document.getElementById('tabla-buses-body');
        if(tbody) tbody.innerHTML = ''; 
        
        buses.forEach(bus => {
            if(tbody) tbody.innerHTML += `
                <tr>
                    <td style="padding: 10px; border: 1px solid #E2E8F0;">${bus.id}</td>
                    <td style="padding: 10px; border: 1px solid #E2E8F0;"><b>${bus.numero_bus}</b></td>
                    <td style="padding: 10px; border: 1px solid #E2E8F0;">${bus.patente || '-'}</td>
                    <td style="padding: 10px; border: 1px solid #E2E8F0;"><span style="background: #C6F6D5; color: #22543D; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">${bus.estado}</span></td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("Error al cargar buses:", error);
    }
}

async function cargarRutas() {
    try {
        const respuesta = await fetch('https://sigci-sin-net.onrender.com/api/rutas');
        const rutas = await respuesta.json();
        const tbody = document.getElementById('tabla-rutas-body');
        if(tbody) tbody.innerHTML = ''; 
        
        rutas.forEach(ruta => {
            if(tbody) tbody.innerHTML += `
                <tr>
                    <td style="padding: 10px; border: 1px solid #E2E8F0;">${ruta.id}</td>
                    <td style="padding: 10px; border: 1px solid #E2E8F0;"><b>${ruta.nombre_ruta}</b></td>
                    <td style="padding: 10px; border: 1px solid #E2E8F0;"><span style="background: #C6F6D5; color: #22543D; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">${ruta.estado}</span></td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("Error al cargar rutas:", error);
    }
}

async function guardarBus() {
    const numero = document.getElementById('nuevo-bus-numero')?.value;
    const patente = document.getElementById('nuevo-bus-patente')?.value;
    
    if (!numero) {
        alert("⚠️ Debes ingresar el número del bus.");
        return;
    }

    try {
        const respuesta = await fetch('https://sigci-sin-net.onrender.com/api/buses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ numero_bus: numero, patente: patente, estado: 'Activo' })
        });

        if (respuesta.ok) {
            alert("✅ Bus guardado con éxito.");
            document.getElementById('nuevo-bus-numero').value = '';
            if(document.getElementById('nuevo-bus-patente')) document.getElementById('nuevo-bus-patente').value = '';
            cargarBuses(); 
        } else {
            alert("❌ Error al guardar el bus.");
        }
    } catch (error) {
        console.error(error);
        alert("No se pudo conectar con el servidor.");
    }
}

async function guardarRuta() {
    const nombre = document.getElementById('nueva-ruta-nombre')?.value;
    
    if (!nombre) {
        alert("⚠️ Debes ingresar el nombre de la ruta.");
        return;
    }

    try {
        const respuesta = await fetch('https://sigci-sin-net.onrender.com/api/rutas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre_ruta: nombre, estado: 'Activo' })
        });

        if (respuesta.ok) {
            alert("✅ Ruta guardada con éxito.");
            document.getElementById('nueva-ruta-nombre').value = '';
            cargarRutas(); 
        } else {
            alert("❌ Error al guardar la ruta.");
        }
    } catch (error) {
        console.error(error);
        alert("No se pudo conectar con el servidor.");
    }
}

// =========================================================
// 5. GESTIÓN DE PERSONAL Y USUARIOS (Panel Admin)
// =========================================================

async function cargarUsuarios() {
    try {
        const respuesta = await fetch('https://sigci-sin-net.onrender.com/api/usuarios');
        const usuarios = await respuesta.json();
        const tbody = document.getElementById('tabla-usuarios-body');
        
        if (!tbody) return;
        tbody.innerHTML = ''; 

        if (usuarios.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 10px;">No hay usuarios registrados.</td></tr>';
            return;
        }

        usuarios.forEach(u => {
            tbody.innerHTML += `
                <tr>
                    <td style="padding: 10px; border: 1px solid #E2E8F0;">${u.id}</td>
                    <td style="padding: 10px; border: 1px solid #E2E8F0;"><b>${u.nombre}</b></td>
                    <td style="padding: 10px; border: 1px solid #E2E8F0;">${u.username}</td>
                    <td style="padding: 10px; border: 1px solid #E2E8F0;"><span style="background: #FEFCBF; color: #744210; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">${u.rol}</span></td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("Error al cargar usuarios:", error);
    }
}

async function guardarUsuario() {
    const nombre = document.getElementById('nuevo-nombre')?.value;
    const username = document.getElementById('nuevo-username')?.value;
    const password = document.getElementById('nuevo-password')?.value;
    const rol = document.getElementById('nuevo-rol')?.value || 'Conductor';

    if (!nombre || !username || !password) {
        alert("⚠️ Por favor completa todos los campos obligatorios.");
        return;
    }

    try {
        const respuesta = await fetch('https://sigci-sin-net.onrender.com/api/usuarios', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, username, password, rol })
        });

        if (respuesta.ok) {
            alert("✅ Usuario creado con éxito.");
            document.getElementById('nuevo-nombre').value = '';
            document.getElementById('nuevo-username').value = '';
            document.getElementById('nuevo-password').value = '';
            cargarUsuarios(); // Recarga la tabla de personal
        } else {
            const data = await respuesta.json();
            alert("❌ Error: " + (data.error || "No se pudo registrar el usuario."));
        }
    } catch (error) {
        console.error(error);
        alert("No se pudo conectar con el servidor.");
    }
}

// =========================================================
// CARGA AUTOMÁTICA AL ABRIR LA PÁGINA
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
    cargarBuses();
    cargarRutas();
    cargarUsuarios(); // <--- Ahora sí carga el personal al iniciar
});