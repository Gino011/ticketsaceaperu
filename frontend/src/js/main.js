const loginForm = document.querySelector('#loginForm');
const errorMsg = document.querySelector('#error-msg');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const usuario = document.querySelector('#username').value;
    const contrasena = document.querySelector('#password').value;

    try {
        const response = await fetch('http://localhost:3000/api/usuarios/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario, contrasena })
        });

        const data = await response.json();
        console.log("Respuesta completa del servidor:", data); 

        if (data.success) {
            // --- EXTRACCIÓN SEGURA DEL ID ---
            // Buscamos el ID dentro de 'user' o directamente en 'data'
            const idFinal = data.id_usuario || (data.user && (data.user.id_usuario || data.user.idUsuario || data.user.id));

            if (!idFinal) {
                console.error("❌ El servidor no envió un ID válido:", data);
                alert("Atención: Login exitoso pero no se encontró el ID del usuario en la respuesta.");
                return;
            }

            // --- GUARDADO EN LOCALSTORAGE ---
            localStorage.setItem('id_usuario', idFinal);
            localStorage.setItem('usuario_nombres', data.user ? data.user.nombres : 'Usuario Acea');
            localStorage.setItem('usuario_correo', data.user ? data.user.correo : 'soporte@aceaperu.com');

            console.log("✅ Sesión guardada con éxito. ID:", idFinal);

            // Redirección al formulario
            window.location.href = '/src/pages/formulario.html'; 
            
        } else {
            // Mostramos el error que viene del backend
            errorMsg.textContent = data.mensaje || data.message || "Credenciales incorrectas";
        }
    } catch (error) {
        console.error("Error en login:", error);
        errorMsg.textContent = "No hay conexión con el servidor de AceaPerú.";
    }
});