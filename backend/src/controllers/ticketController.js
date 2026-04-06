const Ticket = require('../models/ticketModel');
const { sendTicketNotification } = require('../services/emailService'); // [NUEVO] Importamos el motor de correos

const registrarTicket = async (req, res) => {
    try {
        console.log("Body recibido:", req.body);
        console.log("Archivos recibidos:", req.files); 

        const id_usuario = req.body.id_usuario;
        const descripcion = req.body.descripcion;
        const correoUsuario = req.body.correo_usuario; // [NUEVO] Asegúrate de que el frontend envíe este campo

        // --- LÓGICA PARA MÚLTIPLES ARCHIVOS ---
        let fotos_concatenadas = null;
        if (req.files && req.files.length > 0) {
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
        // Nota: Guardamos el resultado para obtener datos si es necesario
        const resultado = await Ticket.create({
            id_usuario: parseInt(id_usuario),
            descripcion: descripcion,
            foto_url: fotos_concatenadas 
        });

        console.log("✅ Ticket guardado con archivos:", fotos_concatenadas);

        // --- [NUEVO] ENVIAR CORREOS ---
        // Intentamos enviar el correo, pero usamos un try/catch interno para que
        // si el correo falla, el usuario no piense que el ticket no se guardó.
        try {
            const datosTicket = {
                id: "NUEVO", // O resultado.insertId si tu modelo lo devuelve
                obra: req.body.nombre_obra || "Obra General", 
                descripcion: descripcion
            };

            // Enviamos a: 1. El usuario que reporta, 2. Al equipo de TI
            await sendTicketNotification(datosTicket, correoUsuario, 'ti@aceaperu.com');
            console.log("📧 Notificaciones enviadas correctamente");
        } catch (mailErr) {
            console.error("⚠️ Error al enviar correos (pero el ticket se guardó):", mailErr.message);
        }

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