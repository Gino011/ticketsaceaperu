document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Variables de Estado ---
    let todosLosTickets = [];
    let paginaActual = 1;
    const registrosPorPagina = 10;

    // --- 2. Referencias DOM ---
    const btnHistorial = document.getElementById('nav-historial');
    const btnNuevo = document.getElementById('nav-nuevo');
    const viewNuevo = document.getElementById('view-nuevo');
    const viewHistorial = document.getElementById('view-historial');
    const tablaCuerpo = document.getElementById('tbody-tickets');
    const inputBusqueda = document.getElementById('inputBusqueda');

    // Referencias para el Previsualizador (Modal)
    const contenedorEvidencia = document.getElementById('contenedorEvidencia');
    const galeriaArchivos = document.getElementById('galeriaArchivos');
    const txtEvidenciaModal = document.getElementById('txtEvidenciaModal');

    // Modal de Confirmación para Finalizar Ticket
    let ticketIdAPendiente = null; // Variable temporal para guardar el ID
    const modalConfirm = new bootstrap.Modal(document.getElementById('modalConfirmarFinalizar'));

    // --- 3. Navegación entre vistas ---
    const cambiarVista = (vista) => {
        if (vista === 'historial') {
            viewNuevo.style.display = 'none';
            viewHistorial.style.display = 'block';
            btnHistorial.classList.add('active');
            btnNuevo.classList.remove('active');
            cargarHistorial(); 
        } else {
            viewNuevo.style.display = 'block';
            viewHistorial.style.display = 'none';
            btnNuevo.classList.add('active');
            btnHistorial.classList.remove('active');
        }
    };

    // --- 4. Carga de datos ---
    const cargarHistorial = async () => {
        const idUsuario = localStorage.getItem('id_usuario') || 1; 

        try {
            tablaCuerpo.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-4">
                        <div class="spinner-border text-primary" role="status"></div>
                        <p class="mt-2 mb-0">Obteniendo registros de AceaPerú...</p>
                    </td>
                </tr>`;

            const response = await fetch(`http://localhost:3000/api/historial/${idUsuario}`);
            const data = await response.json();

            if (data.success) {
                todosLosTickets = data.tickets;
                mostrarPagina(1);
            }
        } catch (error) {
            console.error("Error:", error);
            tablaCuerpo.innerHTML = '<tr><td colspan="6" class="text-center text-danger py-4">Error de conexión.</td></tr>';
        }
    };

    // --- 5. Lógica de Paginación y Renderizado ---
    const mostrarPagina = (pagina, listaUsar = todosLosTickets) => {
        paginaActual = pagina;
        tablaCuerpo.innerHTML = "";

        const inicio = (pagina - 1) * registrosPorPagina;
        const fin = inicio + registrosPorPagina;
        const ticketsPaginados = listaUsar.slice(inicio, fin);

        if (ticketsPaginados.length === 0) {
            tablaCuerpo.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-muted">No hay tickets disponibles.</td></tr>';
            return;
        }

        ticketsPaginados.forEach(ticket => {
            const fecha = new Date(ticket.fecha_registro).toLocaleDateString('es-PE');
            const totalArchivos = ticket.foto_url ? ticket.foto_url.split(',').length : 0;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="fw-bold text-secondary small">#${ticket.id_ticket}</td>
                <td>${fecha}</td>
                <td class="text-truncate" style="max-width: 200px;">${ticket.descripcion}</td>
                <td>
                    ${totalArchivos > 0 
                        ? `<button type="button" class="btn btn-sm btn-outline-primary py-0 fw-bold" 
                                   onclick="window.abrirPrevisualizador('${ticket.foto_url}', ${ticket.id_ticket})">
                            <i class="bi bi-images"></i> Ver ${totalArchivos > 1 ? `(${totalArchivos})` : ''}
                           </button>` 
                        : '<span class="text-muted small">Sin archivo</span>'}
                </td>
                <td>
                    <span class="badge" 
                        style="background-color: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; font-size: 10px; font-weight: 700; padding: 4px 10px; border-radius: 6px; text-transform: uppercase;">
                        <i class="bi bi-send-check-fill"></i> ENVIADO
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm border-0 py-1 px-3" 
                            onclick="window.finalizarTicket(${ticket.id_ticket})" 
                            style="font-size: 11px; font-weight: 700; background-color: #ffd2d0; color: #c20000; border-radius: 20px; transition: all 0.2s;">
                        <i class="bi bi-check2-square me-1"></i> FINALIZAR
                    </button>
                </td>
            `;
            tablaCuerpo.appendChild(tr);
        });

        renderizarControlesPaginacion(listaUsar.length);
    };

    // --- 6. Controles de Paginación ---
    const renderizarControlesPaginacion = (totalRegistros) => {
        let nav = document.getElementById('nav-paginacion');
        if (!nav) {
            nav = document.createElement('nav');
            nav.id = 'nav-paginacion';
            nav.className = "mt-3";
            tablaCuerpo.closest('.table-responsive').after(nav);
        }

        const totalPaginas = Math.ceil(totalRegistros / registrosPorPagina);
        let htmlButtons = `<ul class="pagination pagination-sm justify-content-end">`;
        for (let i = 1; i <= totalPaginas; i++) {
            htmlButtons += `
                <li class="page-item ${paginaActual === i ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="event.preventDefault(); window.cambiarPagina(${i})">${i}</a>
                </li>`;
        }
        htmlButtons += `</ul>`;
        nav.innerHTML = totalPaginas > 1 ? htmlButtons : "";
    };

    // --- 7. Buscador ---
    inputBusqueda.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase().trim();
        const filtrados = todosLosTickets.filter(t => 
            t.descripcion.toLowerCase().includes(term) || 
            t.id_ticket.toString().includes(term)
        );
        mostrarPagina(1, filtrados);
    });

    // --- 8. Funciones Globales para el Modal y Onclicks ---
    window.cambiarPagina = (n) => mostrarPagina(n);

    window.abrirPrevisualizador = (listaFotosRaw, idTicket) => {
        galeriaArchivos.innerHTML = "";
        txtEvidenciaModal.textContent = `Evidencia Ticket #${idTicket}`;
        const archivos = listaFotosRaw.split(',').map(a => a.trim());

        const cargarArchivo = (nombreArchivo) => {
        const url = `http://localhost:3000/uploads/${nombreArchivo}`;
        const ext = nombreArchivo.split('.').pop().toLowerCase();

        if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) {
            // Para imágenes: agregamos el nombre debajo de la foto
            contenedorEvidencia.innerHTML = `
                <div class="text-center">
                    <img src="${url}" class="img-fluid rounded-3 shadow-lg mb-3" style="max-height: 70vh;">
                    <p class="text-muted small fw-bold"><i class="bi bi-file-image me-1"></i> ${nombreArchivo}</p>
                </div>`;
        } else {
            let icono = 'bi-file-earmark-arrow-down';
            let color = 'btn-primary';
            if (ext === 'pdf') { icono = 'bi-file-pdf'; color = 'btn-danger'; }
            if (['xlsx', 'xls', 'csv'].includes(ext)) { icono = 'bi-file-earmark-excel'; color = 'btn-success'; }

            contenedorEvidencia.innerHTML = `
                <div class="bg-white p-5 rounded-4 shadow-lg text-center mx-auto" style="max-width: 400px;">
                    <i class="bi ${icono} display-1 text-secondary mb-3 d-block"></i>
                    <h5 class="text-white fw-bold">Archivo .${ext.toUpperCase()}</h5>
                    <p class="text-muted text-break mb-3" style="font-size: 0.9rem;">${nombreArchivo}</p>
                    <a href="${url}" target="_blank" class="btn ${color} w-100 mt-2 fw-bold">DESCARGAR</a>
                </div>`;
        }
    };

        if (archivos.length > 1) {
            archivos.forEach((arch, i) => {
                const btn = document.createElement('button');
                btn.className = "btn btn-sm btn-light border px-3";
                btn.innerHTML = `Doc ${i+1}`;
                btn.onclick = () => {
                    document.querySelectorAll('#galeriaArchivos .btn').forEach(b => b.classList.replace('btn-primary', 'btn-light'));
                    btn.classList.replace('btn-light', 'btn-primary');
                    cargarArchivo(arch);
                };
                galeriaArchivos.appendChild(btn);
            });
            galeriaArchivos.firstChild.classList.replace('btn-light', 'btn-primary');
        }

        cargarArchivo(archivos[0]);
        const m = bootstrap.Modal.getOrCreateInstance(document.getElementById('modalEvidencia'));
        m.show();
    };

    window.finalizarTicket = (id) => {
        if(confirm(`¿Deseas finalizar el ticket #${id}?`)) {
            alert(`Ticket #${id} finalizado.`);
        }
    };

    // --- FUNCIONES GLOBALES ---


window.finalizarTicket = (id) => {
    ticketIdAPendiente = id; // Guardamos el ID que viene de la tabla
    document.getElementById('mensajeConfirmar').innerText = `¿Deseas finalizar el ticket #${id}?`;
    modalConfirm.show(); // Mostramos el modal elegante
};

// Evento para el botón "Finalizar Ticket" DENTRO del modal
document.getElementById('btnConfirmarFinalizar').addEventListener('click', async () => {
    if (!ticketIdAPendiente) return;

    try {
        const response = await fetch(`http://localhost:3000/api/historial/finalizar/${ticketIdAPendiente}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' }
        });

        const result = await response.json();
if (result.success) {
    modalConfirm.hide();
    
    // En lugar de alert() usamos SweetAlert2
    Swal.fire({
        title: '¡Finalizado!',
        text: `El ticket #${ticketIdAPendiente} ha sido archivado.`,
        icon: 'success',
        confirmButtonColor: '#1e293b' // Color oscuro como tu botón
    });

        cargarHistorial(); 
    }
        } catch (error) {
            console.error("Error:", error);
            alert("No se pudo conectar con el servidor.");
        }
    });

    btnHistorial.addEventListener('click', () => cambiarVista('historial'));
    btnNuevo.addEventListener('click', () => cambiarVista('nuevo'));
});