const User = require('../models/userModel');

const login = async (req, res) => {
    const { usuario, contrasena } = req.body;

    try {
        // 1. Pedir al modelo que busque al usuario
        const dbUser = await User.findByUsername(usuario);

        // 2. Validar si existe
        if (!dbUser) {
            return res.status(401).json({ success: false, mensaje: "Usuario no encontrado" });
        }

        // 3. Validar contraseña (comparación directa por ahora)
        if (dbUser.contrasena === contrasena) {
            res.json({ 
                success: true, 
                mensaje: "¡Login exitoso!",
                user: { id: dbUser.id_usuario, nombre: dbUser.usuario } 
            });
        } else {
            res.status(401).json({ success: false, mensaje: "Contraseña incorrecta" });
        }
    } catch (err) {
        res.status(500).json({ success: false, error: "Error interno del servidor" });
    }
};

module.exports = { login };