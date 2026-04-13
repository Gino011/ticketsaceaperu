const HistorialModel = require('../models/historialModel');

/**
 * Obtener todos los tickets activos de un usuario
 */
const getHistorialPorUsuario = async (req, res) => {
    // Obtenemos el id_usuario de los parámetros de la URL
    const { id_usuario } = req.params;

    try {
        // 1. Llamamos al método del Modelo que obtiene tickets con activo = 1
        const tickets = await HistorialModel.getTicketsByUserId(id_usuario);
        
        // 2. Respondemos con éxito y los datos
        res.json({
            success: true,
            count: tickets.length,
            tickets: tickets
        });

    } catch (error) {
        // 3. Si algo sale mal, enviamos el error detallado
        console.error("❌ Error en getHistorialPorUsuario:", error.message);
        res.status(500).json({
            success: false,
            message: 'Error al obtener el historial desde el servidor',
            error: error.message
        });
    }
};

/**
 * Finalizar un ticket (Borrado lógico: activo = 0)
 */
const finalizarTicket = async (req, res) => {
    // Obtenemos el id del ticket desde la URL
    const { id_ticket } = req.params;

    try {
        // 1. Llamamos al Modelo para actualizar el campo 'activo' a 0
        const actualizado = await HistorialModel.updateTicketActivo(id_ticket);

        if (actualizado) {
            // 2. Si se afectaron filas, respondemos éxito
            res.json({
                success: true,
                message: `Ticket #${id_ticket} finalizado correctamente.`
            });
        } else {
            // 3. Si no se afectó nada (ID inexistente)
            res.status(404).json({
                success: false,
                message: 'No se encontró el ticket solicitado o ya está inactivo.'
            });
        }

    } catch (error) {
        console.error("❌ Error en finalizarTicket:", error.message);
        res.status(500).json({
            success: false,
            message: 'Error interno al intentar finalizar el ticket',
            error: error.message
        });
    }
};

// Exportamos ambas funciones
module.exports = {
    getHistorialPorUsuario,
    finalizarTicket
};