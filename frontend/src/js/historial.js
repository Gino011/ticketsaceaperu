document.addEventListener('DOMContentLoaded', () => {
    // --- Variables de Estado ---
    let todosLosTickets = [];
    let paginaActual = 1;
    const registrosPorPagina = 10;

    // --- Referencias DOM ---
    const btnHistorial = document.getElementById('nav-historial');
    const btnNuevo = document.getElementById('nav-nuevo');
    const viewNuevo = document.getElementById('view-nuevo');
    const viewHistorial = document.getElementById('view-historial');
    const tablaCuerpo = document.getElementById('tbody-tickets');
    const inputBusqueda = document.getElementById('inputBusqueda');

    // 1. Navegación entre vistas
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

    // 2. Carga inicial de datos
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
                mostrarPagina(1); // Renderiza la primera tanda de 10
            }
        } catch (error) {
            console.error("Error:", error);
            tablaCuerpo.innerHTML = '<tr><td colspan="6" class="text-center text-danger py-4">Error de conexión.</td></tr>';
        }
    };

    // 3. Lógica de Paginación y Renderizado
    const mostrarPagina = (pagina, listaUsar = todosLosTickets) => {
        paginaActual = pagina;
        tablaCuerpo.innerHTML = "";

        // Cortamos el array de 10 en 10
        const inicio = (pagina - 1) * registrosPorPagina;
        const fin = inicio + registrosPorPagina;
        const ticketsPaginados = todosLosTickets.slice(inicio, fin);

        if (ticketsPaginados.length === 0) {
            tablaCuerpo.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-muted">No hay tickets disponibles.</td></tr>';
            return;
        }

       ticketsPaginados.forEach(ticket => {
    const fecha = new Date(ticket.fecha_registro).toLocaleDateString('es-PE');
    
    // SOLUCIÓN AL ERROR: Separamos las fotos por coma y tomamos solo la primera
    const fotosArray = ticket.foto_url ? ticket.foto_url.split(',') : [];
    const primeraFoto = fotosArray.length > 0 ? fotosArray[0].trim() : null;

    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td class="fw-bold text-secondary small">#${ticket.id_ticket}</td>
        <td>${fecha}</td>
        <td class="text-truncate" style="max-width: 200px;">${ticket.descripcion}</td>
        <td>
            ${primeraFoto 
                ? `<a href="http://localhost:3000/uploads/${primeraFoto}" target="_blank" class="btn btn-sm btn-outline-primary py-0" title="Ver evidencia">
                    <i class="bi bi-image"></i> Ver ${fotosArray.length > 1 ? `(${fotosArray.length})` : ''}
                   </a>` 
                : '<span class="text-muted small">Sin foto</span>'}
        </td>
        <td>
            <span class="badge" 
                style="background-color: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; font-size: 10px; font-weight: 700; padding: 4px 10px; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.8px; display: inline-flex; align-items: center; gap: 4px;">
                <i class="bi bi-send-check-fill" style="font-size: 12px;"></i> ENVIADO
            </span>
        </td>
        <td>
            <button class="btn btn-sm border-0 py-1 px-3" 
                    onclick="finalizarTicket(${ticket.id_ticket})" 
                    style="font-size: 11px; font-weight: 700; background-color: #f1f5f9; color: #1e293b; border-radius: 20px; transition: all 0.2s; letter-spacing: 0.5px;"
                    onmouseover="this.style.backgroundColor='#1e293b'; this.style.color='#ffffff';" 
                    onmouseout="this.style.backgroundColor='#f1f5f9'; this.style.color='#1e293b';">
                <i class="bi bi-check2-square me-1"></i> FINALIZAR
            </button>
        </td>
    `;
    tablaCuerpo.appendChild(tr);
});

renderizarControlesPaginacion();
    };

    // 4. Generar botones de paginación
    const renderizarControlesPaginacion = () => {
        let nav = document.getElementById('nav-paginacion');
        if (!nav) {
            nav = document.createElement('nav');
            nav.id = 'nav-paginacion';
            nav.className = "mt-3";
            tablaCuerpo.closest('.table-responsive').after(nav);
        }

        const totalPaginas = Math.ceil(todosLosTickets.length / registrosPorPagina);
        let htmlButtons = `<ul class="pagination pagination-sm justify-content-end">`;
        
        for (let i = 1; i <= totalPaginas; i++) {
            htmlButtons += `
                <li class="page-item ${paginaActual === i ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="event.preventDefault(); window.cambiarPagina(${i})">${i}</a>
                </li>`;
        }
        htmlButtons += `</ul>`;
        nav.innerHTML = htmlButtons;
    };

    // 5. Buscador (Filtra en toda la data y reinicia paginación)
    inputBusqueda.addEventListener('keyup', (e) => {
        const term = e.target.value.toLowerCase();
        const filtrados = todosLosTickets.filter(t => 
            t.descripcion.toLowerCase().includes(term) || 
            t.id_ticket.toString().includes(term)
        );
        
        // Guardamos temporalmente para mostrar búsqueda
        const dataOriginal = todosLosTickets;
        todosLosTickets = filtrados;
        mostrarPagina(1);
        todosLosTickets = dataOriginal; 
    });

    // Exponer funciones al objeto window para los onclick del HTML dinámico
    window.cambiarPagina = (n) => mostrarPagina(n);
    window.finalizarTicket = (id) => {
        if(confirm(`¿Deseas finalizar el ticket #${id}?`)) {
            alert(`Ticket #${id} finalizado.`);
        }
    };

    // Eventos de botones de menú
    btnHistorial.addEventListener('click', () => cambiarVista('historial'));
    btnNuevo.addEventListener('click', () => cambiarVista('nuevo'));
});