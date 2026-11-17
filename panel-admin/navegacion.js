document.addEventListener("DOMContentLoaded", () => {
    // Mapeo de los botones del menú con sus respectivas vistas y títulos
    const rutasMenu = {
        'btn-resumen': { vista: 'vista-resumen', titulo: 'Resumen General' },
        'btn-ventas': { vista: 'vista-ventas', titulo: 'Historial de Ventas' },
        'btn-rutas': { vista: 'vista-rutas', titulo: 'Gestión de Rutas' },
        'btn-buses': { vista: 'vista-buses', titulo: 'Administración de Flota' },
        'btn-personal': { vista: 'vista-personal', titulo: 'Personal' },
        'btn-reportes': { vista: 'vista-reportes', titulo: 'Reportes y Estadísticas' },
        'btn-alertas': { vista: 'vista-alertas', titulo: 'Centro de Alertas' },
        'btn-configuracion': { vista: 'vista-configuracion', titulo: 'Configuración' }
    };

    // Seleccionar todos los botones del menú
    const botonesMenu = document.querySelectorAll('.menu li');
    const tituloSeccion = document.getElementById('titulo-seccion');

    botonesMenu.forEach(boton => {
        boton.addEventListener('click', function() {
            // 1. Quitar la clase 'active' de todos los botones
            botonesMenu.forEach(btn => btn.classList.remove('active'));
            
            // 2. Agregar la clase 'active' al botón clickeado
            this.classList.add('active');

            // 3. Ocultar todas las vistas
            document.querySelectorAll('.vista').forEach(vista => {
                vista.style.display = 'none';
            });

            // 4. Mostrar la vista correspondiente y cambiar el título
            const configuracionRuta = rutasMenu[this.id];
            if (configuracionRuta) {
                document.getElementById(configuracionRuta.vista).style.display = 'block';
                tituloSeccion.innerText = configuracionRuta.titulo;
            }
        });
    });
}); 