const { poolPromise, sql } = require('../config/db');

const User = {
    /**
     * Busca al usuario por su nombre de usuario (usado en el Login)
     */
    findByUsername: async (usuario) => {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('usuario', sql.VarChar, usuario)
                .query('SELECT * FROM TB_USUARIOS WHERE usuario = @usuario');
            
            return result.recordset[0]; // Retorna el usuario o undefined
        } catch (err) {
            console.error("❌ Error en findByUsername:", err.message);
            throw err;
        }
    },

    /**
     * Busca al usuario por su ID (usado para obtener el nombre real en los Tickets)
     */
    findById: async (id_usuario) => {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('id_usuario', sql.Int, id_usuario)
                .query('SELECT id_usuario, nombres, correo FROM TB_USUARIOS WHERE id_usuario = @id_usuario');
            
            return result.recordset[0]; // Retorna los datos del usuario (id, nombres, correo)
        } catch (err) {
            console.error("❌ Error en findById:", err.message);
            throw err;
        }
    }
};

module.exports = User;