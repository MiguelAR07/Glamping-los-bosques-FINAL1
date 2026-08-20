require('dotenv').config();
const { transporter, sendReservationConfirmedEmail } = require('./src/services/nodemailer.service.js');

async function sendAllCorrections() {
  console.log('Enviando correos con las correcciones financieras al Administrador y Clientes via Brevo...');

  // 1. Enviar correo a SALOMÉ PATIÑO (Reserva 2)
  const dataSalome = {
    reservaId: 2,
    facturaId: 2,
    clienteNombre: 'SALOMÉ PATIÑO',
    documento: '1036936278',
    cabana: 'Cabaña Palmas',
    plan: 'Fin de Semana / Festivo - Reserva - Cabaña Palmas',
    llegada: '16/08/2026',
    salida: '17/08/2026',
    huespedes: 'Ninguno',
    total: 350000,
    pagoRestante: 180000,
    amountPaid: 170000,
    adultos: 2,
    ninos: 0,
    mascotas: 0
  };

  try {
    await sendReservationConfirmedEmail('Salomep382@gmail.com', dataSalome);
    console.log('✅ Correo enviado a cliente Salomé Patiño (Salomep382@gmail.com)');
  } catch (err) {
    console.error('Error enviando a Salomé:', err.message);
  }

  // 2. Enviar resumen consolidado al Administrador
  const adminEmail = process.env.EMAIL_USER || 'panelglampinglosbosques@gmail.com';
  try {
    await transporter.sendMail({
      from: `"Sistema Glamping" <${adminEmail}>`,
      to: adminEmail,
      subject: '📌 Resumen Actualizado de Reservas y Finanzas Corregidas',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: white; border-radius: 10px; border: 1px solid #e2e8f0;">
          <h2 style="color: #059669; text-align: center; margin-top: 0;">📌 Resumen de Correcciones Financieras</h2>
          <p>Hola Administrador,</p>
          <p>Se han actualizado las finanzas y saldos de las reservas en el sistema:</p>

          <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin-bottom: 16px; border: 1px solid #e2e8f0;">
            <h3 style="margin: 0 0 8px 0; color: #1e293b;">Reserva #1 - JEFFERSON GIMENEZ (Cabaña Roble)</h3>
            <ul style="margin: 0; padding-left: 20px; color: #475569;">
              <li><strong>Precio Total:</strong> $ 280.000 COP</li>
              <li><strong>Abono Confirmado:</strong> $ 140.000 COP</li>
              <li><strong>Saldo Restante por cobrar:</strong> $ 140.000 COP</li>
            </ul>
          </div>

          <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin-bottom: 16px; border: 1px solid #e2e8f0;">
            <h3 style="margin: 0 0 8px 0; color: #1e293b;">Reserva #2 - SALOMÉ PATIÑO (Cabaña Palmas)</h3>
            <ul style="margin: 0; padding-left: 20px; color: #475569;">
              <li><strong>Precio Total:</strong> $ 350.000 COP</li>
              <li><strong>Abono Confirmado:</strong> $ 170.000 COP</li>
              <li><strong>Saldo Restante por cobrar:</strong> $ 180.000 COP</li>
            </ul>
          </div>

          <div style="background: #ecfdf5; padding: 16px; border-radius: 8px; border: 1px solid #a7f3d0;">
            <p style="margin: 0; color: #065f46; font-weight: bold;">💰 Total recaudado efectivamente abonado en gráfica e ingresos: $ 310.000 COP</p>
          </div>
        </div>
      `
    });
    console.log(`✅ Correo de resumen enviado al Administrador (${adminEmail})`);
  } catch (err) {
    console.error('Error enviando al admin:', err.message);
  }
}

sendAllCorrections().catch(console.error);
