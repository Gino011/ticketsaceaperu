const { poolPromise, sql } = require('../config/db');

class HistorialModel {
    /**
     * Consulta los tickets del usuario en la tabla TB_TICKET
     * @param {number} id_usuario - ID obtenido desde el login
     */
    static async getTicketsByUserId(id_usuario) {
        try {
            // 1. Esperamos la conexión del pool que ya tienes en db.js
            const pool = await poolPromise;
            
            // 2. Ejecutamos la consulta con los nombres reales de tu tabla
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
                    WHERE id_usuario = @id 
                    ORDER BY fecha_registro DESC
                `);

            // 3. Retornamos los registros encontrados
            return result.recordset;
        } catch (error) {
            // Log detallado en consola para debuguear rápido
            console.error("❌ Error en HistorialModel (SQL):", error.message);
            throw error; 
        }
    }
}

module.exports = HistorialModel;