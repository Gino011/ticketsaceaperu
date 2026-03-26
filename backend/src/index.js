require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { poolPromise } = require('./config/db'); 
const userRoutes = require('./routes/userRoutes'); // 1. Importamos las rutas de usuario

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// 2. Usar las rutas de usuario
// Ahora todas las rutas de usuario empezarán con /api/usuarios
app.use('/api/usuarios', userRoutes); 

// --- RUTA DE PRUEBA DE BASE DE DATOS ---
app.get('/test-db', async (req, res) => {
    try {
        const pool = await poolPromise; 
        const result = await pool.request().query('SELECT GETDATE() as fecha');
        res.json({ 
            mensaje: "¡Conexión exitosa!", 
            fechaServidor: result.recordset[0].fecha 
        });
    } catch (err) {
        res.status(500).json({ 
            error: "Error conectando a la base de datos", 
            detalle: err.message 
        });
    }
});

// Ruta base
app.get('/', (req, res) => {
    res.json({ mensaje: "API de TicketAceaPeru lista" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`✅ Rutas de usuarios listas en http://localhost:${PORT}/api/usuarios`);
});