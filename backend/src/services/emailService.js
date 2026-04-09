const nodemailer = require('nodemailer');
const path = require('path');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true, 
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendTicketNotification = async (ticketData, userEmail) => {
    const { id_ticket, nombre_usuario, obra, descripcion } = ticketData;

    const ahora = new Date();
    const pad = (n) => n.toString().padStart(2, '0');
    const timestampID = `${ahora.getFullYear()}${pad(ahora.getMonth() + 1)}${pad(ahora.getDate())}-` +
                        `${pad(ahora.getHours())}${pad(ahora.getMinutes())}${pad(ahora.getSeconds())}-` +
                        `${ahora.getMilliseconds().toString().padStart(3, '0')}`;

    const fechaFormal = ahora.toLocaleString('es-PE', { timeZone: 'America/Lima' });
    const logoPath = path.join(__dirname, '../../../frontend/src/assets/logoaceaperu.png'); 

    const htmlContent = `
        <div style="background-color: #ffffff; padding: 40px 10px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333333;">
            <div style="max-width: 600px; margin: 0 auto; border: 1px solid #aaaaaa; padding: 40px;">
                
                <div style="margin-bottom: 40px; border-bottom: 1px solid #000000; padding-bottom: 20px;">
                    <img src="cid:logo_acea" alt="AceaPerú" style="width: 130px; height: auto;">
                </div>

                <div style="margin-bottom: 30px;">
                    <h1 style="font-size: 18px; font-weight: 600; color: #1a1a1a; margin-bottom: 10px; letter-spacing: -0.5px;">
                        Notificación de Registro de Ticket
                    </h1>
                    <p style="font-size: 14px; color: #000000; line-height: 1.5;">
                        Estimado(a) <strong>${nombre_usuario}</strong>, su requerimiento ha sido ingresado al sistema con los siguientes detalles:
                    </p>
                </div>

                <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                    <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #f9f9f9; color: #000000; font-size: 12px; text-transform: uppercase; width: 40%;">ID de Ticket</td>
                        <td style="padding: 12px 0; border-bottom: 1px solid #f9f9f9; color: #004a99; font-weight: 700; font-size: 14px;">#${id_ticket}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #f9f9f9; color: #000000; font-size: 12px; text-transform: uppercase;">Código de Trazabilidad</td>
                        <td style="padding: 12px 0; border-bottom: 1px solid #f9f9f9; color: #000000; font-family: monospace; font-size: 13px;">${timestampID}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #f9f9f9; color: #000000; font-size: 12px; text-transform: uppercase;">Ubicación / Obra</td>
                        <td style="padding: 12px 0; border-bottom: 1px solid #f9f9f9; color: #000000; font-size: 14px;">${obra}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; color: #000000; font-size: 12px; text-transform: uppercase; vertical-align: top;">Descripción</td>
                        <td style="padding: 12px 0; color: #000000; font-size: 14px; line-height: 1.6;">${descripcion}</td>
                    </tr>
                </table>

                <div style="border-left: 2px solid #004a99; padding-left: 20px; margin: 40px 0;">
                    <p style="font-size: 13px; color: #000000; font-style: italic; margin: 0;">
                        Nuestro equipo técnico ha sido notificado y se encuentra revisando su solicitud. No es necesario responder a este mensaje.
                    </p>
                </div>

                <div style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #000000;">
                    <table style="width: 100%;">
                        <tr>
                            <td style="font-size: 11px; color: #000000;">
                                <strong>AceaPerú S.A.C.</strong><br>
                                Departamento de Tecnología de la Información
                            </td>
                            <td style="text-align: right; font-size: 11px; color: #000000; vertical-align: bottom;">
                                Emitido el ${fechaFormal}
                            </td>
                        </tr>
                    </table>
                </div>
            </div>
        </div>
    `;

    const mailOptions = {
        from: `"AceaPerú HelpDesk" <${process.env.EMAIL_USER}>`,
        html: htmlContent,
        attachments: [{
            filename: 'logoaceaperu.png',
            path: logoPath,
            cid: 'logo_acea' 
        }]
    };

    try {
        await transporter.sendMail({ ...mailOptions, to: userEmail, subject: `Ticket #${id_ticket} - Confirmación de Registro` });
        await transporter.sendMail({ ...mailOptions, to: 'ti@aceaperu.com', subject: `[NUEVO TICKET] #${id_ticket} - ${nombre_usuario}` });
        console.log(`✅ Notificación elegante enviada: Ticket ${id_ticket}`);
    } catch (error) {
        console.error("❌ Error en el envío:", error.message);
    }
};

module.exports = { sendTicketNotification };