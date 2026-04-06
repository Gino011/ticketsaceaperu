const { poolPromise, sql } = require('../config/db');

const Ticket = {
    create: async (ticketData) => {
        try {
            const pool = await poolPromise;
            
            // Usamos los nombres exactos de tu tabla: id_usuario, descripcion, foto_url
            const result = await pool.request()
                .input('id_usuario', sql.Int, ticketData.id_usuario)
                // Usamos sql.MAX para la descripción por seguridad
                .input('descripcion', sql.VarChar(sql.MAX), ticketData.descripcion)
                // --- CAMBIO CLAVE AQUÍ ---
                // Cambiamos 255 por sql.MAX para que quepan muchos nombres de archivos
                .input('foto_url', sql.VarChar(sql.MAX), ticketData.foto_url || null)
                .query(`
                    INSERT INTO TB_TICKET (id_usuario, descripcion, foto_url)
                    VALUES (@id_usuario, @descripcion, @foto_url)
                `);
            
            return result;
        } catch (err) {
            console.error("❌ ERROR EN SQL SERVER (TB_TICKET):", err.message);
            throw err;
        }
    }
};

module.exports = Ticket;