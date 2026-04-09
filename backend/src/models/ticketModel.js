const { poolPromise, sql } = require('../config/db');

const Ticket = {
    create: async (ticketData) => {
        try {
            const pool = await poolPromise;
            
            const result = await pool.request()
                .input('id_usuario', sql.Int, ticketData.id_usuario)
                .input('descripcion', sql.VarChar(sql.MAX), ticketData.descripcion)
                .input('foto_url', sql.VarChar(sql.MAX), ticketData.foto_url || null)
                // --- CAMBIO FUNDAMENTAL AQUÍ ---
                // Agregamos OUTPUT INSERTED.id_ticket para capturar el ID generado
                .query(`
                    INSERT INTO TB_TICKET (id_usuario, descripcion, foto_url, activo)
                    OUTPUT INSERTED.id_ticket
                    VALUES (@id_usuario, @descripcion, @foto_url, 1)
                `);
            
            // Retornamos el primer registro del resultado, que contiene el nuevo id_ticket
            return result.recordset[0]; 
        } catch (err) {
            console.error("❌ ERROR EN SQL SERVER (TB_TICKET):", err.message);
            throw err;
        }
    }
};

module.exports = Ticket;