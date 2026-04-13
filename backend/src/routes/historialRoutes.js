const express = require('express');
const router = express.Router();

// Importamos ambas funciones del controlador
const { 
    getHistorialPorUsuario, 
    finalizarTicket 
} = require('../controllers/historialController');

/**
 * @route   GET /api/historial/:id_usuario
 * @desc    Obtener tickets activos (activo = 1)
 */
router.get('/:id_usuario', getHistorialPorUsuario);

/**
 * @route   PUT /api/historial/finalizar/:id_ticket
 * @desc    Finalizar ticket (Cambiar activo a 0)
 */
router.put('/finalizar/:id_ticket', finalizarTicket);

module.exports = router;