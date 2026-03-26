const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Definimos la ruta de login
// Se activará en: POST http://localhost:3000/api/usuarios/login
router.post('/login', userController.login);

module.exports = router;