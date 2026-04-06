const Ticket = require('../models/ticketModel');

const registrarTicket = async (req, res) => {
    try {
        console.log("Body recibido:", req.body);
        // Ahora logueamos req.files (plural)
        console.log("Archivos recibidos:", req.files); 

        const id_usuario = req.body.id_usuario;
        const descripcion = req.body.descripcion;

        // --- LÓGICA PARA MÚLTIPLES ARCHIVOS ---
        // req.files es el array que crea Multer cuando usas .array()
        let fotos_concatenadas = null;
        
        if (req.files && req.files.length > 0) {
            // Juntamos los nombres de todos los archivos: "123-foto1.jpg, 456-doc.pdf"
            fotos_concatenadas = req.files.map(file => file.filename).join(',');
        }

        // VALIDACIÓN DE SEGURIDAD
        if (!id_usuario || id_usuario === 'undefined' || id_usuario === 'null') {
            return res.status(400).json({ 
                success: false, 
                mensaje: "Sesión no válida. El ID de usuario es NULL." 
            });
        }

        // INSERTAR EN SQL
        await Ticket.create({
            id_usuario: parseInt(id_usuario),
            descripcion: descripcion,
            // Guardamos la lista de nombres (o null si no hubo nada)
            foto_url: fotos_concatenadas 
        });

        console.log("✅ Ticket guardado con archivos:", fotos_concatenadas);
        res.status(201).json({ success: true, mensaje: "Ticket registrado con éxito en AceaPerú" });

    } catch (err) {
        console.error("❌ ERROR DETALLADO:", err.message);
        res.status(500).json({ 
            success: false, 
            mensaje: "Error de SQL: " + err.message 
        });
    }
};

module.exports = { registrarTicket };