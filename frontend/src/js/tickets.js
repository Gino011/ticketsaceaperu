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

    // 4. Lógica de Envío CORREGIDA
    if (formTicket) {
        formTicket.addEventListener('submit', async (e) => {
            e.preventDefault();

            const idEnStorage = localStorage.getItem('id_usuario');
            if (!idEnStorage || idEnStorage === "null") {
                alert("❌ Error: Sesión no encontrada.");
                return;
            }
            
            // [NUEVO] Capturamos el correo del usuario (del input o del storage)
            const correoUsuario = inputCorreoEmisor ? inputCorreoEmisor.value : localStorage.getItem('usuario_correo');
            const nombreObra = "Obra AceaPerú"; // Aquí puedes capturar el valor de un input de obra si lo tienes

            const descripcion = inputDescripcion ? inputDescripcion.value.trim() : '';
            const formData = new FormData();

            formData.append('id_usuario', idEnStorage);
            formData.append('descripcion', descripcion);

            // [NUEVO] Enviamos el correo y la obra al backend
            formData.append('correo_usuario', correoUsuario); 
            formData.append('nombre_obra', nombreObra);
            
            // CAMBIO AQUÍ: Enviar todas las fotos del array, no del input
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
                    alert("✅ " + result.mensaje);
                    
                    // --- LIMPIEZA TOTAL ---
                    formTicket.reset();
                    archivosSeleccionados = []; // Vaciamos el array
                    previewContainer.innerHTML = ''; // Borramos miniaturas visuales
                    previewContainer.classList.add('preview-hidden');
                    fileContent.style.display = 'flex';
                    
                    cargarDatosSesion();
                } else {
                    alert("❌ Error: " + result.mensaje);
                }
            } catch (error) {
                console.error("Error al enviar:", error);
                alert("📡 Error de conexión.");
            }
        });
    }

    cargarDatosSesion();
    actualizarReloj();
    setInterval(actualizarReloj, 1000);
});