const nodemailer = require('nodemailer');
const path = require('path');

// Configuración del transporte (usa tus variables de entorno)
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true, // true para puerto 465
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendTicketNotification = async (ticketData, userEmail) => {
    const { id_ticket, nombre_usuario, obra, descripcion } = ticketData;

    // Formateo de fecha y trazabilidad
    const ahora = new Date();
    const fechaFormal = ahora.toLocaleString('es-PE', { timeZone: 'America/Lima' });
    
    // Generamos un ID de trazabilidad único basado en el tiempo
    const trazabilidad = `${ahora.getFullYear()}${(ahora.getMonth()+1)}${ahora.getDate()}-${ahora.getTime()}`;

    // Ruta al logo (Asegúrate de que esta ruta sea correcta en tu estructura)
    const logoPath = path.join(__dirname, '../../../frontend/src/assets/logoaceaperu.png'); 

    const htmlContent = `
        <div style="background-color: #f4f4f4; padding: 20px; font-family: Arial, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #dddddd; padding: 40px;">
                
                <div style="border-bottom: 2px solid #000000; padding-bottom: 20px; margin-bottom: 20px;">
                    <img src="cid:logo_acea" alt="AceaPerú" style="width: 150px; height: auto;">
                </div>

                <h2 style="color: #000000; font-size: 20px;">Confirmación de Registro de Ticket</h2>
                <p style="font-size: 15px; color: #000000;">
                    Estimado(a) <strong>${nombre_usuario}</strong>, hemos recibido tu requerimiento correctamente, este correo es una confirmación del registro.
                </p>

                <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; width: 30%;">ID Ticket:</td>
                        <td style="padding: 10px; border-bottom: 1px solid #eee; color: #004a99; font-weight: bold">#${id_ticket}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Nombre del usuario:</td>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">${nombre_usuario}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Estado:</td>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;"><span style="color: #28a745; font-weight: bold;">RECIBIDO</span></td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; font-weight: bold; vertical-align: top;">Descripción:</td>
                        <td style="padding: 10px; line-height: 1.5; color: #000000;">${descripcion}</td>
                    </tr>
                </table>

                <div style="margin-top: 30px; padding: 15px; background-color: #e6e5e5; border-left: 4px solid #004a99;">
                    <p style="font-size: 12px; color: #000000; margin: 0;">
                        Nuestro equipo técnico ha sido notificado y revisará tu solicitud a la brevedad. 
                        <strong>No es necesario responder a este correo.</strong>
                    </p>
                </div>

                <div style="margin-top: 40px; border-top: 1px solid #000000; padding-top: 20px; font-size: 11px; color: #000000; text-align: center;">
                    <p>AceaPerú - Departamento de TI</p>
                    <p>Emitido el: ${fechaFormal} | Ref: ${trazabilidad}</p>
                </div>
            </div>
        </div>
    `;

    const mailOptions = {
        from: `"Sistema de Tickets" <${process.env.EMAIL_USER}>`,
        html: htmlContent,
        attachments: [{
            filename: 'logoaceaperu.png',
            path: logoPath,
            cid: 'logo_acea' 
        }]
    };

    try {
        // 1. Enviar al usuario
        await transporter.sendMail({
            ...mailOptions,
            to: userEmail,
            subject: `Ticket Registrado #${id_ticket} - ${nombre_usuario} `
        });

        // 2. Enviar copia al equipo de TI
        await transporter.sendMail({
            ...mailOptions,
            to: 'ti@aceaperu.com', // Cambia esto al correo real de TI
            subject: `🚨 NUEVO TICKET: #${id_ticket} - ${nombre_usuario}`
        });

        console.log(`✅ Correos enviados para el ticket #${id_ticket}`);
    } catch (error) {
        console.error("❌ Error enviando correos:", error.message);
        throw error; 
    }
};

module.exports = { sendTicketNotification };