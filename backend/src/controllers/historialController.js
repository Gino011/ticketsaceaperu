const HistorialModel = require('../models/historialModel');

const getHistorialPorUsuario = async (req, res) => {
    // Obtenemos el id_usuario de los parámetros de la URL
    const { id_usuario } = req.params;

    try {
        // 1. Llamamos al método del Modelo que acabas de crear
        const tickets = await HistorialModel.getTicketsByUserId(id_usuario);
        
        // 2. Respondemos con éxito y los datos
        res.json({
            success: true,
            count: tickets.length,
            tickets: tickets
        });

    } catch (error) {
        // 3. Si algo sale mal, enviamos el error detallado
        console.error("❌ Error en historialController:", error.message);
        res.status(500).json({
            success: false,
            message: 'Error al obtener el historial desde el servidor',
            error: error.message
        });
    }
};

module.exports = {
    getHistorialPorUsuario
};