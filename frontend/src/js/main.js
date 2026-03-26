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

    if (data.success) {
      // --- PASO CRUCIAL PARA ACEAPERÚ ---
      // Guardamos el ID y los datos para usarlos en el formulario
      localStorage.setItem('id_usuario', data.id_usuario);
      localStorage.setItem('usuario_nombres', data.user.nombres);
      localStorage.setItem('usuario_correo', data.user.correo);

      // Redirección
      window.location.href = '/src/pages/formulario.html'; 
    } else {
      // Usamos el mensaje que viene del backend (data.message o data.mensaje)
      errorMsg.textContent = data.message || data.mensaje || "Credenciales incorrectas";
    }
  } catch (error) {
    console.error("Error en login:", error);
    errorMsg.textContent = "No hay conexión con el servidor de AceaPerú.";
  }
});