const sql = require('mssql');
require('dotenv').config();

// Mantenemos la configuración limpia usando las variables del .env
const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    options: {
        encrypt: false, // Cambiar a true si usas Azure
        trustServerCertificate: true // Necesario para conexiones locales (localhost)
    }
};

// Usamos un Pool de conexiones (más eficiente y escalable)
const poolPromise = new sql.ConnectionPool(dbConfig)
    .connect()
    .then(pool => {
        console.log('✅ Conectado a SQL Server: ' + process.env.DB_DATABASE);
        return pool;
    })
    .catch(err => {
        console.error('❌ Error de conexión a SQL Server:', err.message);
        process.exit(1); // Detiene la app si no hay base de datos
    });

module.exports = {
    sql,
    poolPromise
};