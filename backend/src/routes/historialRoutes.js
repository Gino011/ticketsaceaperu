const express = require('express');
const router = express.Router();

// Importamos el controlador (fíjate que la ruta sea correcta según tu carpeta)
const { getHistorialPorUsuario } = require('../controllers/historialController');

/**
 * Endpoint: GET /api/historial/:id_usuario
 * @description Ruta para obtener el historial de tickets de AceaPerú por ID de usuario
 */
router.get('/:id_usuario', getHistorialPorUsuario);

module.exports = router;