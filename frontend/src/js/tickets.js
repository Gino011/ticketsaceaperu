// Asegúrate de que esto sea lo único que maneje la carga de datos
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Referencias a los inputs del HTML
    const nombreInput = document.getElementById('nombreUsuario');
    const correoEmisorInput = document.getElementById('correoUser');
    const correoDestinoInput = document.getElementById('correo_destino');
    const fechaHoraInput = document.getElementById('fechaHora');

    // 2. Función para cargar datos de la sesión
    const cargarDatosSesion = () => {
        // Obtenemos los datos tal cual se guardaron en el Login
        const nombre = localStorage.getItem('nombres');
        const correo = localStorage.getItem('correo');

        console.log("Intentando cargar:", { nombre, correo }); // Debug en consola

        if (nombreInput) {
            nombreInput.value = nombre ? nombre : 'Usuario no identificado';
        }
        if (correoEmisorInput) {
            correoEmisorInput.value = correo ? correo : 'soporte@aceaperu.com.pe';
        }
        // El correo destino que pidió tu jefe
        if (correoDestinoInput) {
            correoDestinoInput.value = 'ti@aceaperu.com.pe';
        }
    };

    // 3. Función del Reloj (Perú)
    const actualizarReloj = () => {
        if (!fechaHoraInput) return;
        
        const ahora = new Date();
        const opciones = {
            timeZone: 'America/Lima',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        };
        fechaHoraInput.value = ahora.toLocaleString('es-PE', opciones);
    };

    // Ejecutar funciones
    cargarDatosSesion();
    setInterval(actualizarReloj, 1000);
    actualizarReloj();
});