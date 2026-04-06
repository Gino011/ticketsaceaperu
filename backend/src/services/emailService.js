const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true, // true para puerto 465 (SSL)
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendTicketNotification = async (ticketData, userEmail) => {
    const { id, obra, descripcion } = ticketData;

    // 1. Correo para el Usuario (Confirmación)
    const userMailOptions = {
        from: `"HelpDesk AceaPerú" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: `Ticket Recibido - #${id} - ${obra}`,
        html: `
            <h1>Hola, hemos recibido tu reporte</h1>
            <p>Se ha generado el ticket <strong>#${id}</strong> correctamente.</p>
            <p><strong>Obra:</strong> ${obra}</p>
            <p><strong>Descripción:</strong> ${descripcion}</p>
            <br>
            <p>Nuestro equipo de soporte técnico lo revisará pronto.</p>
        `,
    };

    // 2. Correo para Soporte (Alerta)
    const adminMailOptions = {
        from: `"Sistema Alertas AceaPerú" <${process.env.EMAIL_USER}>`,
        to: 'ti@aceaperu.com', // <-- Cambia por el correo real de soporte
        subject: `NUEVO TICKET GENERADO: ${obra}`,
        text: `Se ha creado un nuevo ticket.\nID: ${id}\nObra: ${obra}\nDescripción: ${descripcion}`,
    };

    try {
        await transporter.sendMail(userMailOptions);
        await transporter.sendMail(adminMailOptions);
        console.log("Correos enviados con éxito");
    } catch (error) {
        console.error("Error enviando correos:", error);
    }
};

module.exports = { sendTicketNotification };