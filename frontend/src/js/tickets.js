document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Referencias a los inputs del HTML (IDs exactos de tu HTML)
    const inputNombre = document.getElementById('nombreUsuario');
    const inputCorreoEmisor = document.getElementById('correoUser');
    const inputCorreoDestino = document.getElementById('correo_destino');
    const inputFechaHora = document.getElementById('fechaHora');

    // 2. Función para cargar datos de la sesión
    const cargarDatosSesion = () => {
        // IMPORTANTE: Usa los mismos nombres que guardaste en el Login
        const nombre = localStorage.getItem('usuario_nombres');
        const correo = localStorage.getItem('usuario_correo');

        console.log("Datos recuperados:", { nombre, correo });

        if (inputNombre) {
            inputNombre.value = nombre ? nombre : 'Usuario no identificado';
        }
        if (inputCorreoEmisor) {
            inputCorreoEmisor.value = correo ? correo : 'soporte@aceaperu.com';
        }
        // Correo destino fijo
        if (inputCorreoDestino) {
            inputCorreoDestino.value = 'ti@aceaperu.com';
        }
    };

    // 3. Función del Reloj (Perú) - ESTA ES LA QUE HACE QUE CORRA EL TIEMPO
    const actualizarReloj = () => {
        if (!inputFechaHora) return;
        
        const ahora = new Date();
        const formatoPeru = ahora.toLocaleString('es-PE', {
            timeZone: 'America/Lima',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
        
        // Escribimos la hora actual en el input
        inputFechaHora.value = formatoPeru.replace(',', ''); 
    };

    // --- EJECUCIÓN ---
    
    // Cargamos los nombres y correos una sola vez
    cargarDatosSesion();

    // Iniciamos el reloj inmediatamente
    actualizarReloj();

    // Hacemos que se actualice cada 1 segundo (1000ms)
    setInterval(actualizarReloj, 1000);
});