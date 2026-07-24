import pool from '../config/db.js';
import { getEmails } from '../models/notification.model.js';
const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

export const transporter = {
  sendMail: async (options) => {
    let toEmail = options.to;
    let toName = 'Cliente';
    
    // Extraer correo de formatos como '"Nombre" <correo>' si es necesario
    if (typeof options.to === 'string' && options.to.includes('<')) {
        const match = options.to.match(/(.*)<(.*)>/);
        if (match) {
            toName = match[1].replace(/"/g, '').trim() || toName;
            toEmail = match[2].trim();
        }
    }

    const payload = {
      sender: { name: 'Sistema Glamping', email: process.env.EMAIL_USER || 'panelglampinglosbosques@gmail.com' },
      to: [{ email: toEmail, name: toName }],
      subject: options.subject,
      htmlContent: options.html || `<p>${options.text || ''}</p>`
    };

    const res = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Error enviando por Brevo:", errText);
      throw new Error("Error enviando por Brevo");
    }
    
    return await res.json();
  }
};

export const sendSystemOnlineEmail = async (urlPublica) => {
  try {
    const res = await pool.query(
      getEmails
    );
    const empleados = res.rows;

    if (empleados.length === 0) return;

    const promises = empleados.map(empleado => {
      return transporter.sendMail({
        from: '"Sistema Glamping" <glampinglosbosques9@gmail.com> ',
        to: empleado.email,
        subject: '🚀 Sistema en línea - Acceso disponible',
        html: `
          <h1>¡Hola!</h1>
          <p>El sistema ya está encendido. Usa el siguiente link para entrar hoy:</p>
          <a href="${urlPublica}" style="display:inline-block; padding:12px; background:#3498db; color:white; text-decoration:none; border-radius:5px;">
            Entrar al Panel
          </a>
          <p>Ruta: ${urlPublica}</p>
        `
      });
    });

    await Promise.all(promises); // Más rápido: envía todos en paralelo
    console.log('✅ Notificaciones enviadas correctamente');
  } catch (error) {
    console.error('❌ Error en EmailService:', error);
  }
};

export const sendVerificationCodeEmail = async (email, code) => {
  try {
    const response = await transporter.sendMail({
      from: '"Sistema Glamping" <glampinglosbosques9@gmail.com>',
      to: email,
      subject: 'Código de verificación de registro',
      html: `
        <h1>Código de Verificación</h1>
        <p>Tu código de verificación para completar el registro es:</p>
        <h2 style="background: #f4f4f4; padding: 10px; display: inline-block; letter-spacing: 2px;">${code}</h2>
        <p>Este código expira en 15 minutos.</p>
      `
    });

    return response;
  } catch (error) {
    console.error('❌ Error en sendVerificationCodeEmail:', error);
  }
}

export const sendReservationConfirmedEmail = async (email, invoiceData) => {
  try {
    const { 
      reservaId, facturaId, clienteNombre, documento, cabana, plan, 
      llegada, salida, huespedes, total, pagoRestante, amountPaid,
      adultos, ninos, mascotas
    } = invoiceData;

    const response = await transporter.sendMail({
      from: '"Glamping Los Bosques" <glampinglosbosques9@gmail.com>',
      to: email,
      subject: `✅ ¡Tu reserva está confirmada! Reserva #${reservaId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">
          <div style="background-color: #059669; padding: 32px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 800;">Reserva #${reservaId}</h1>
            <p style="margin: 8px 0 0 0; color: #d1fae5; font-size: 16px;">Detalles de la estadía y reserva</p>
          </div>
          
          <div style="padding: 32px; background-color: #fafaf9;">
            <h2 style="margin: 0 0 24px 0; font-size: 20px; color: #1c1917; border-bottom: 1px solid #e7e5e4; padding-bottom: 16px;">Resumen de la Reserva</h2>
            
            <div style="margin-bottom: 20px;">
              <p style="margin: 0; color: #444; font-weight: bold; font-size: 16px;">${cabana}</p>
              <p style="margin: 4px 0 0 0; color: #666; font-size: 14px;">${plan}</p>
            </div>
            
            <div style="margin-bottom: 20px;">
              <p style="margin: 0; color: #444; font-weight: bold; font-size: 16px;">Fecha</p>
              <p style="margin: 4px 0 0 0; color: #666; font-size: 14px;">${llegada} - ${salida}</p>
              <p style="margin: 4px 0 0 0; color: #059669; font-weight: bold; font-size: 14px;">Check-in 3:00 PM / Check-out 1:00 PM</p>
            </div>

            <div style="margin-bottom: 20px;">
              <p style="margin: 0; color: #444; font-weight: bold; font-size: 16px;">Huéspedes y Mascotas</p>
              <ul style="margin: 8px 0 0 0; padding-left: 20px; color: #666; font-size: 14px;">
                <li>Adultos y niños mayores a 3 años: <strong>${adultos !== undefined ? adultos : 2}</strong></li>
                <li>Niños menores a 3 años: <strong>${ninos || 0}</strong></li>
                <li>Mascotas: <strong>${mascotas || 0}</strong></li>
              </ul>
              <p style="margin: 8px 0 0 0; color: #666; font-size: 14px;"><strong>Servicios adicionales:</strong> ${huespedes}</p>
            </div>
            
            <div style="margin-top: 32px; background: white; padding: 16px; border-radius: 8px; border: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 12px; color: #6b7280; font-weight: 700; text-transform: uppercase;">A NOMBRE DE</p>
              <p style="margin: 4px 0 0 0; font-size: 16px; font-weight: 600; color: #111827;">${clienteNombre}</p>
              <p style="margin: 4px 0 0 0; font-size: 14px; color: #6b7280;">Documento: ${documento}</p>
            </div>

            <div style="margin-top: 24px; background: white; padding: 24px; border-radius: 12px; border: 1px solid #e5e7eb;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #4b5563; font-weight: 600;">TOTAL A PAGAR</span>
                <span style="color: #059669; font-size: 24px; font-weight: 800;">$${Number(total).toLocaleString('es-CO')}</span>
              </div>
              <div style="margin-top: 16px; border-top: 1px solid #e5e7eb; padding-top: 16px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <span style="color: #6b7280;">Abono pagado:</span>
                  <span style="color: #374151;">$${Number(amountPaid).toLocaleString('es-CO')}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6b7280;">Saldo pendiente en Glamping:</span>
                  <span style="color: #dc2626; font-weight: 600;">$${Number(pagoRestante).toLocaleString('es-CO')}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div style="text-align: center; padding: 24px; background: white; border-top: 1px solid #e5e7eb;">
            ${pagoRestante > 0 ? `
            <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin-bottom: 20px; border: 1px solid #ffeeba;">
              <p style="margin: 0; color: #856404; text-align: left;">
                <strong>⚠️ Importante:</strong> Tienes un saldo pendiente de <strong>$${pagoRestante.toLocaleString('es-CO')}</strong>.<br>
                Por favor, recuerda pagar este 50% restante antes de tu llegada a nuestras instalaciones.<br><br>
                👉 <a href="https://panel.glampinglosbosques.com/pagar-saldo/${reservaId}" style="color: #155724; font-weight: bold; text-decoration: underline;">PAGAR RESTANTE $${pagoRestante.toLocaleString('es-CO')}</a>
              </p>
            </div>
            ` : ''}
            <p style="color: #666; margin: 0;">¡Te esperamos pronto en Glamping Los Bosques!</p>
          </div>
        </div>
      `
    });

    return response;
  } catch (error) {
    console.error('❌ Error enviando email de confirmación (factura):', error);
    return null;
  }
}

export const sendAdminNotificationEmail = async (clienteNombre, llegada, salida, adultos = 2, ninos = 0, mascotas = 0) => {
  try {
    await transporter.sendMail({
      from: '"Sistema Glamping" <glampinglosbosques9@gmail.com>',
      to: process.env.EMAIL_USER, // Se envía al propio correo del administrador
      subject: '🔔 Nueva Reserva Confirmada',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 10px;">
          <h1 style="color: #059669; text-align: center;">Nueva Reserva Confirmada</h1>
          <p>Has confirmado exitosamente la reserva del cliente <strong>${clienteNombre}</strong>.</p>
          <div style="background-color: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <ul style="list-style: none; padding-left: 0;">
              <li>📅 <strong>Llegada:</strong> ${llegada}</li>
              <li>📅 <strong>Salida:</strong> ${salida}</li>
              <li>👥 <strong>Adultos y niños mayores a 3 años:</strong> ${adultos}</li>
              <li>👶 <strong>Niños menores a 3 años:</strong> ${ninos}</li>
              <li>🐾 <strong>Mascotas:</strong> ${mascotas}</li>
            </ul>
          </div>
          <p style="text-align: center;">Revisa el panel de control para más detalles.</p>
        </div>
      `
    });
  } catch (error) {
    console.error('❌ Error enviando notificación al admin:', error);
  }
};

export const sendPasswordResetEmail = async (email, code) => {
  try {
    const response = await transporter.sendMail({
      from: '"Sistema Glamping" <glampinglosbosques9@gmail.com>',
      to: email,
      subject: '🔑 Recuperación de Contraseña',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 10px;">
          <h2 style="color: #3498db; text-align: center;">Código de Recuperación</h2>
          <p>Has solicitado restablecer tu contraseña. Ingresa el siguiente código de 6 dígitos en la página para confirmar tu nueva contraseña:</p>
          <div style="text-align: center; margin: 20px 0;">
            <span style="font-size: 24px; font-weight: bold; background: #f4f4f4; padding: 10px 20px; border-radius: 5px; letter-spacing: 5px;">${code}</span>
          </div>
          <p>Este código expira en 15 minutos.</p>
          <p style="color: #888; font-size: 12px; margin-top: 30px;">Si no fuiste tú, puedes ignorar este correo.</p>
        </div>
      `
    });
    return response;
  } catch (error) {
    console.error('❌ Error en sendPasswordResetEmail:', error);
    throw error;
  }
}

export const sendReservationRejectedEmail = async (email, clienteNombre, motivo) => {
  try {
    const response = await transporter.sendMail({
      from: '"Glamping Los Bosques" <glampinglosbosques9@gmail.com>',
      to: email,
      subject: '❌ Tu reserva ha sido rechazada',
      text: `Hola ${clienteNombre}, Lamentamos informarte que hemos tenido un problema al validar tu reserva. Motivo del rechazo: ${motivo}. Por favor comunícate con nosotros inmediatamente.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 10px;">
          <h1 style="color: #c92a2a; text-align: center;">Reserva Rechazada</h1>
          <p>Hola <strong>${clienteNombre}</strong>,</p>
          <p>Lamentamos informarte que hemos tenido un problema al validar tu reserva o tu comprobante de pago.</p>
          
          <div style="background-color: #fff5f5; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #c92a2a;">
            <h3 style="margin-top: 0; color: #8b1c1c;">Motivo del rechazo:</h3>
            <p style="color: #333; font-size: 16px;">${motivo}</p>
          </div>
          
          <p>Si consideras que esto es un error, por favor comunícate con nosotros inmediatamente para solucionarlo.</p>
          <p style="text-align: center; font-size: 18px; margin-top: 30px;">Atentamente,<br/>Glamping Los Bosques</p>
        </div>
      `
    });

    return response;
  } catch (error) {
    console.error('❌ Error enviando email de rechazo:', error);
    return null;
  }
}

export const sendRescheduleEmail = async (clienteEmail, clienteNombre, llegada, salida) => {
  try {
    await transporter.sendMail({
      from: '"Panel Glamping" <panelglampinglosbosques@gmail.com>',
      to: clienteEmail,
      subject: '🗓️ Reprogramación de tu Reserva',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 10px;">
          <h1 style="color: #0d6efd; text-align: center;">Tu reserva ha sido reprogramada</h1>
          <p>Hola <strong>${clienteNombre}</strong>,</p>
          <p>Tal como lo acordamos, hemos actualizado las fechas de tu estadía. Los nuevos detalles son:</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <ul style="list-style: none; padding-left: 0;">
              <li>📅 <strong>Nueva Fecha de Llegada:</strong> ${llegada}</li>
              <li>📅 <strong>Nueva Fecha de Salida:</strong> ${salida}</li>
            </ul>
          </div>
          
          <p>Si tienes alguna duda, puedes contactarnos nuevamente por WhatsApp.</p>
          <p style="color: #666; font-size: 12px; text-align: center; margin-top: 30px;">
            Glamping Los Bosques
          </p>
        </div>
      `
    });
    console.log('✅ Email de reprogramación enviado.');
  } catch (error) {
    console.error('❌ Error enviando email de reprogramación:', error);
  }
};

export const sendCancelEmail = async (clienteEmail, clienteNombre) => {
  try {
    await transporter.sendMail({
      from: '"Glamping Los Bosques" <panelglampinglosbosques@gmail.com>',
      to: clienteEmail,
      subject: '❌ Cancelación de tu Reserva',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 10px;">
          <h1 style="color: #c92a2a; text-align: center;">Reserva Cancelada</h1>
          <p>Hola <strong>${clienteNombre}</strong>,</p>
          <p>Te informamos que tu reserva ha sido <strong>cancelada</strong>.</p>
          
          <div style="background-color: #fff5f5; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #c92a2a;">
            <p style="color: #333; font-size: 16px;">Cualquier duda o solicitud de reembolso, por favor contáctanos lo más pronto posible.</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://wa.me/573103599065" style="background-color: #25D366; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              💬 Contáctanos por WhatsApp
            </a>
          </div>
          
          <p style="text-align: center; font-size: 18px; margin-top: 30px;">Atentamente,<br/>Glamping Los Bosques</p>
        </div>
      `
    });
    console.log('✅ Email de cancelación enviado.');
  } catch (error) {
    console.error('❌ Error enviando email de cancelación:', error);
  }
};

export const sendForceMajeureCancelEmail = async (clienteEmail, clienteNombre) => {
  try {
    await transporter.sendMail({
      from: '"Glamping Los Bosques" <panelglampinglosbosques@gmail.com>',
      to: clienteEmail,
      subject: '⚠️ Cancelación de reserva por Fuerza Mayor',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 10px;">
          <h1 style="color: #c92a2a; text-align: center;">Aviso Importante sobre tu Reserva</h1>
          <p>Hola <strong>${clienteNombre}</strong>,</p>
          <p>Lamentamos informarte que debido a situaciones de fuerza mayor en la vereda (como cortes imprevistos de luz o agua), nos vemos en la necesidad de <strong>cancelar temporalmente tu reserva</strong> para garantizarte una experiencia de calidad y justa.</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0d6efd;">
            <h3 style="margin-top: 0; color: #0d6efd;">Comunícate con Administración</h3>
            <p>Por favor, comunícate directamente con la administración del glamping a través de nuestro WhatsApp oficial para brindarte una solución inmediata (reprogramación o devolución de dinero):</p>
            <div style="text-align: center; margin-top: 25px; margin-bottom: 15px;">
              <a href="https://wa.me/573103599065" style="background-color: #25D366; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">Hablar con el Administrador</a>
            </div>
          </div>
          
          <p>Lamentamos profundamente los inconvenientes y esperamos recibirte muy pronto en mejores condiciones.</p>
          <p style="text-align: center; font-size: 18px; margin-top: 30px;">Atentamente,<br/>Glamping Los Bosques</p>
        </div>
      `
    });
    console.log('✅ Email de cancelación por fuerza mayor enviado.');
  } catch (error) {
    console.error('❌ Error enviando email de cancelación por fuerza mayor:', error);
  }
};

export const sendPromotionEmailToClients = async (emails, promoDetails) => {
  try {
    const { nombre, descripcion, precio, img_url, id } = promoDetails;
    
    // El enlace apuntará a la landing page con la promoción preseleccionada
    const bookingLink = `${process.env.NGROK_FRONTEND_URL || 'http://localhost:5173'}/reservas?promo=promo_${id}`;

    await transporter.sendMail({
      from: '"Glamping Los Bosques" <panelglampinglosbosques@gmail.com>',
      bcc: emails, // Usar BCC para que los clientes no vean los correos de otros
      subject: `✨ ¡Nueva Promoción! ${nombre}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 10px;">
          <h1 style="color: #059669; text-align: center;">¡Tenemos una oferta especial para ti!</h1>
          
          <div style="text-align: center; margin-bottom: 20px;">
            ${img_url ? `<img src="${img_url}" alt="${nombre}" style="max-width: 100%; border-radius: 8px; max-height: 300px; object-fit: cover;" />` : ''}
          </div>
          
          <h2 style="color: #333; text-align: center;">${nombre}</h2>
          
          <p style="color: #555; font-size: 16px; text-align: center; line-height: 1.5;">
            ${descripcion || 'Aprovecha esta increíble promoción por tiempo limitado y disfruta de la mejor experiencia en Glamping Los Bosques.'}
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <span style="display: block; font-size: 14px; color: #888;">Precio promocional desde</span>
            <span style="font-size: 28px; font-weight: bold; color: #059669;">$ ${Number(precio).toLocaleString('es-CO')} / noche</span>
          </div>
          
          <div style="text-align: center; margin-top: 30px; margin-bottom: 20px;">
            <a href="${bookingLink}" style="background-color: #059669; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px; display: inline-block;">¡Reservar Ahora!</a>
          </div>
          
          <p style="color: #888; font-size: 12px; text-align: center; margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px;">
            Has recibido este correo porque estás registrado en Glamping Los Bosques.
          </p>
        </div>
      `
    });
    console.log(`✅ Email de promoción enviado a ${emails.length} clientes.`);
  } catch (error) {
    console.error('❌ Error enviando email de promoción:', error);
    throw error;
  }
};