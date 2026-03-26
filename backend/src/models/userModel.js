const { poolPromise, sql } = require('../config/db');

const User = {
    // Busca al usuario por su nombre en SQL Server
    findByUsername: async (usuario) => {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('usuario', sql.VarChar, usuario)
                .query('SELECT * FROM TB_USUARIOS WHERE usuario = @usuario');
            return result.recordset[0]; // Retorna el primer usuario encontrado o undefined
        } catch (err) {
            throw err;
        }
    }
};

module.exports = User;