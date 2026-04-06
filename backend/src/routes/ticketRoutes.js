const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const ticketController = require('../controllers/ticketController');

// 1. Configuración de Almacenamiento (Multer)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); 
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + file.originalname;
        cb(null, uniqueSuffix);
    }
});

// Opcional: Puedes agregar un filtro aquí para que acepte PDF/Word si quieres ser estricto
const upload = multer({ storage: storage });

// 2. Definir la ruta POST - CAMBIO AQUÍ:
// Usamos .array('nombre_del_campo', maximo_de_archivos)
router.post('/registrar', upload.array('evidencia', 10), ticketController.registrarTicket);

module.exports = router;