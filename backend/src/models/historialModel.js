const { poolPromise, sql } = require('../config/db');

class HistorialModel {
    /**
     * Obtener solo tickets ACTIVOS (activo = 1)
     */
    static async getTicketsByUserId(id_usuario) {
        try {
            const pool = await poolPromise;
            
            const result = await pool.request()
                .input('id', sql.Int, id_usuario)
                .query(`
                    SELECT 
                        id_ticket, 
                        id_usuario,
                        fecha_registro, 
                        descripcion, 
                        foto_url,
                        activo 
                    FROM TB_TICKET 
                    WHERE id_usuario = @id AND activo = 1 -- <--- IMPORTANTE: Solo activos
                    ORDER BY fecha_registro DESC
                `);

            return result.recordset;
        } catch (error) {
            console.error("❌ Error en HistorialModel (getTickets):", error.message);
            throw error; 
        }
    }

    /**
     * CAMBIAR ESTADO A FINALIZADO (El método que te faltaba)
     */
    static async updateTicketActivo(id_ticket) {
        try {
            const pool = await poolPromise;
            
            const result = await pool.request()
                .input('idTicket', sql.Int, id_ticket)
                .query(`
                    UPDATE TB_TICKET 
                    SET activo = 0 
                    WHERE id_ticket = @idTicket
                `);

            // Retorna true si se actualizó el registro
            return result.rowsAffected[0] > 0;
        } catch (error) {
            console.error("❌ Error en HistorialModel (updateTicket):", error.message);
            throw error;
        }
    }
}

module.exports = HistorialModel;