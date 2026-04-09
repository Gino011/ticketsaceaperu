const Ticket = require('../models/ticketModel');
const Usuario = require('../models/userModel'); 
const { sendTicketNotification } = require('../services/emailService');

const registrarTicket = async (req, res) => {
    try {
        console.log("📥 Procesando nuevo ticket...");

        const { id_usuario, descripcion, correo_usuario, nombre_obra } = req.body;

        // 1. VALIDACIÓN INICIAL
        if (!id_usuario || id_usuario === 'undefined') {
            return res.status(400).json({ success: false, mensaje: "ID de usuario no válido." });
        }

        // 2. MANEJO DE FOTOS
        let fotos_concatenadas = null;
        if (req.files && req.files.length > 0) {
            fotos_concatenadas = req.files.map(file => file.filename).join(',');
        }

        // 3. INSERTAR EN LA BASE DE DATOS
        const resultado = await Ticket.create({
            id_usuario: parseInt(id_usuario),
            descripcion: descripcion,
            foto_url: fotos_concatenadas 
        });

        // --- CAPTURA DEL ID GENERADO ---
        // Intentamos obtener el ID desde diferentes lugares según cómo responda tu modelo
        const idGenerado = resultado.id_ticket || 
                           (resultado.recordset && resultado.recordset[0].id_ticket) || 
                           "N/A";
        
        console.log("✅ Ticket guardado con ID:", idGenerado);

        // 4. OBTENER EL NOMBRE REAL DEL USUARIO (Usando la nueva función findById)
        let nombreReal = req.body.nombre_usuario || "Usuario AceaPerú"; 
        try {
            const datosUsuario = await Usuario.findById(id_usuario);
            if (datosUsuario && datosUsuario.nombres) {
                nombreReal = datosUsuario.nombres; // Accedemos a la columna 'nombres' de tu SQL
            }
        } catch (dbErr) {
            console.error("⚠️ No se pudo traer el nombre de la BD:", dbErr.message);
        }

        // 5. ENVIAR NOTIFICACIÓN POR CORREO
        try {
            const datosTicketParaCorreo = {
                id_ticket: idGenerado,
                nombre_usuario: nombreReal, 
                obra: nombre_obra || "Obra AceaPerú", 
                descripcion: descripcion
            };

            await sendTicketNotification(datosTicketParaCorreo, correo_usuario);
            console.log("📧 Notificación enviada correctamente a:", nombreReal);
        } catch (mailErr) {
            console.error("⚠️ El ticket se guardó, pero falló el envío de correo:", mailErr.message);
        }

        // 6. RESPUESTA AL FRONTEND
        res.status(201).json({ 
            success: true, 
            mensaje: "Ticket registrado con éxito", 
            id: idGenerado 
        });

    } catch (err) {
        console.error("❌ ERROR GENERAL EN EL CONTROLADOR:", err.message);
        res.status(500).json({ success: false, mensaje: "Error interno: " + err.message });
    }
};

module.exports = { registrarTicket };