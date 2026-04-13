require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path'); // <-- NUEVO: Para manejar rutas de archivos
const { poolPromise } = require('./config/db'); 
const userRoutes = require('./routes/userRoutes'); 
const ticketRoutes = require('./routes/ticketRoutes'); // <-- NUEVO: Importamos rutas de tickets
const historialRoutes = require('./routes/historialRoutes'); // <-- NUEVO: Importamos rutas de historial
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
// NUEVO: Permite recibir datos de formularios con archivos
app.use(express.urlencoded({ extended: true }));

// --- CONFIGURACIÓN DE CARPETA UPLOADS ---
// Esto hace que las fotos sean accesibles vía URL
// Como 'uploads' está en la raíz y este archivo en 'src', usamos '..'
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 2. Usar las rutas
app.use('/api/usuarios', userRoutes); 
app.use('/api/tickets', ticketRoutes); // <-- NUEVO: Ahora los tickets funcionan en /api/tickets
app.use('/api/historial', historialRoutes);
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
    console.log(`🎫 Rutas de tickets listas en http://localhost:${PORT}/api/tickets`); // <-- NUEVO aviso
    console.log(`📜 Rutas de historial listas en http://localhost:${PORT}/api/historial`);
});