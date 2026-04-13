document.addEventListener('DOMContentLoaded', () => {
    // 1. Referencias
    const inputNombre = document.getElementById('nombreUsuario');
    const inputCorreoEmisor = document.getElementById('correoUser');
    const inputCorreoDestino = document.getElementById('correo_destino');
    const inputFechaHora = document.getElementById('fechaHora');
    const formTicket = document.getElementById('ticketForm');
    const inputDescripcion = document.getElementById('descripcion');
    const inputAdjunto = document.getElementById('adjunto');
    
    const previewContainer = document.getElementById('preview-container');
    const fileContent = document.getElementById('file-content');

    // Mantenemos el array global de fotos

    const cargarDatosSesion = () => {
        const nombre = localStorage.getItem('usuario_nombres');
        const correo = localStorage.getItem('usuario_correo');
        if (inputNombre) inputNombre.value = nombre || 'Usuario no identificado';
        if (inputCorreoEmisor) inputCorreoEmisor.value = correo || 'soporte@aceaperu.com';
        if (inputCorreoDestino) inputCorreoDestino.value = 'ti@aceaperu.com';
    };

    const actualizarReloj = () => {
        if (!inputFechaHora) return;
        const ahora = new Date();
        const formatoPeru = ahora.toLocaleString('es-PE', {
            timeZone: 'America/Lima',
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit',
            hour12: true
        });
        inputFechaHora.value = formatoPeru.replace(',', ''); 
    };

    // --- LÓGICA PARA MÚLTIPLES FOTOS ---
    // --- LÓGICA PARA MÚLTIPLES ARCHIVOS (FOTOS Y DOCUMENTOS) ---
    let archivosSeleccionados = []; // Asegúrate de que esta variable esté declarada arriba

    if (inputAdjunto) {
        inputAdjunto.addEventListener('change', function() {
            const files = Array.from(this.files);
            
            // Mostramos el contenedor y ocultamos el mensaje de "Arrastre aquí"
            fileContent.style.display = 'none';
            previewContainer.classList.remove('preview-hidden');

            files.forEach((file) => {
                // Agregamos el archivo al array global
                archivosSeleccionados.push(file); 

                const reader = new FileReader();
                reader.onload = function(e) {
                    const wrapper = document.createElement('div');
                    wrapper.className = 'thumbnail-wrapper';
                    
                    // Asignamos el índice actual del array
                    const currentIndex = archivosSeleccionados.length - 1;
                    wrapper.setAttribute('data-index', currentIndex);

                    // --- LÓGICA DE PREVISUALIZACIÓN SEGÚN TIPO ---
                    let contenidoPreview = '';
                    
                    if (file.type.startsWith('image/')) {
                        // Si es imagen, mostramos la foto normal
                        contenidoPreview = `<img src="${e.target.result}" style="width:100%; height:100%; object-fit:cover; border-radius:6px;">`;
                    } else {
                        // Si es documento, determinamos el color y el texto del icono
                        let color = '#7f8c8d'; // Gris genérico
                        let label = 'DOC';

                        if (file.type === 'application/pdf') {
                            color = '#e74c3c'; // Rojo PDF
                            label = 'PDF';
                        } else if (file.type.includes('word')) {
                            color = '#2b579a'; // Azul Word
                            label = 'WORD';
                        } else if (file.type.includes('sheet') || file.type.includes('excel')) {
                            color = '#217346'; // Verde Excel
                            label = 'EXCEL';
                        }

                        contenidoPreview = `
                            <div style="width:100%; height:100%; background-color:${color}; color:white; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:12px; border-radius:6px; flex-direction:column; padding:5px; text-align:center;">
                                <span>${label}</span>
                                <small style="font-size:8px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; width:100%;">${file.name}</small>
                            </div>`;
                    }

                    wrapper.innerHTML = `
                        ${contenidoPreview}
                        <button type="button" class="close-btn" title="Eliminar">&times;</button>
                    `;

                    // Lógica para borrar archivo individual
                    wrapper.querySelector('.close-btn').onclick = function(event) {
                        event.stopPropagation();
                        const idxToRemove = parseInt(wrapper.getAttribute('data-index'));
                        
                        // Quitamos del array y de la pantalla
                        archivosSeleccionados.splice(idxToRemove, 1); 
                        wrapper.remove(); 

                        // Re-indexamos los elementos restantes
                        const remainingThumbs = previewContainer.querySelectorAll('.thumbnail-wrapper');
                        remainingThumbs.forEach((thumb, newIdx) => {
                            thumb.setAttribute('data-index', newIdx);
                        });
                        
                        // Si se queda vacío, mostramos el cuadro inicial
                        if (archivosSeleccionados.length === 0) {
                            previewContainer.classList.add('preview-hidden');
                            fileContent.style.display = 'flex';
                        }
                    };

                    previewContainer.appendChild(wrapper);
                };
                
                // Leemos el archivo
                reader.readAsDataURL(file);
            });

            // Limpiamos el input para permitir re-selección
            this.value = ''; 
        });
    }

    // 4. Lógica de Envío CORREGIDA (Con SweetAlert2)
if (formTicket) {
    formTicket.addEventListener('submit', async (e) => {
        e.preventDefault();

        const idEnStorage = localStorage.getItem('id_usuario');
        if (!idEnStorage || idEnStorage === "null") {
            // [NUEVO] Error de sesión elegante
            Swal.fire({ icon: 'error', title: 'Sesión no encontrada', text: 'Por favor, vuelve a iniciar sesión.' });
            return;
        }

        // [NUEVO] Spinner de carga inmediato
        Swal.fire({
            title: 'Procesando ticket...',
            text: 'Enviando información y archivos a AceaPerú',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
        
        const correoUsuario = inputCorreoEmisor ? inputCorreoEmisor.value : localStorage.getItem('usuario_correo');
        const nombreObra = "Obra AceaPerú"; 
        const descripcion = inputDescripcion ? inputDescripcion.value.trim() : '';
        const formData = new FormData();

        formData.append('id_usuario', idEnStorage);
        formData.append('descripcion', descripcion);
        formData.append('correo_usuario', correoUsuario); 
        formData.append('nombre_obra', nombreObra);
        
        archivosSeleccionados.forEach((foto) => {
            formData.append('evidencia', foto);
        });

        try {
            const response = await fetch('http://localhost:3000/api/tickets/registrar', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                // [NUEVO] Éxito con SweetAlert2
                Swal.fire({
                    icon: 'success',
                    title: '¡Registro Exitoso!',
                    text: result.mensaje,
                    confirmButtonColor: '#004a99'
                }).then(() => {
                    // --- LIMPIEZA TOTAL (se ejecuta después de dar OK) ---
                    formTicket.reset();
                    archivosSeleccionados = [];
                    previewContainer.innerHTML = '';
                    previewContainer.classList.add('preview-hidden');
                    fileContent.style.display = 'flex';
                    cargarDatosSesion();
                });
            } else {
                // [NUEVO] Error del servidor elegante
                Swal.fire({
                    icon: 'error',
                    title: 'Hubo un problema',
                    text: 'Demasiados archivos enviados o nombre de los archivos muy largos'/*result.mensaje*/,
                    confirmButtonColor: '#d33'
                });
            }
        } catch (error) {
            console.error("Error al enviar:", error);
            // [NUEVO] Error de conexión elegante
            Swal.fire({
                icon: 'error',
                title: 'Error de conexión',
                text: 'No se pudo contactar con el servidor. Inténtalo más tarde.',
                confirmButtonColor: '#d33'
            });
        }
    });
}

    cargarDatosSesion();
    actualizarReloj();
    setInterval(actualizarReloj, 1000);
});