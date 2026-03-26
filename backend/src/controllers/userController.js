const User = require('../models/userModel');

const login = async (req, res) => {
    const { usuario, contrasena } = req.body;

    try {
        const dbUser = await User.findByUsername(usuario);

        if (!dbUser) {
            return res.status(401).json({ success: false, mensaje: "Usuario no encontrado" });
        }

        if (dbUser.contrasena === contrasena) {
            // Enviamos TODO lo que necesita el formulario y la base de datos
            res.json({
                success: true,
                user: {
                    id: dbUser.id_usuario, // Necesario para la tabla TB_TICKET
                    nombres: dbUser.nombres, 
                    correo: dbUser.correo
                }
            });
        } else {
            res.status(401).json({ success: false, mensaje: "Contraseña incorrecta" });
        }
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ success: false, error: "Error interno" });
    }
};

module.exports = { login };