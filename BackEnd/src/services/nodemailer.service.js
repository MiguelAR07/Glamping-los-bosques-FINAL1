import pool from '../config/db.js';
import nodemailer from 'nodemailer';
import { getEmails } from '../models/notification.model.js';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  connectionTimeout: 10000, // 10 segundos
  greetingTimeout: 10000,
  socketTimeout: 10000
});

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

export const sendReservationConfirmedEmail = async (email, clienteNombre, llegada, salida) => {
  try {
    const response = await transporter.sendMail({
      from: '"Glamping Los Bosques" <glampinglosbosques9@gmail.com>',
      to: email,
      subject: '✅ ¡Tu reserva está confirmada!',
      text: `Hola ${clienteNombre}, Nos alegra informarte que hemos validado tu comprobante de pago exitosamente. Tu reserva en Glamping Los Bosques está confirmada. Llegada: ${llegada}, Salida: ${salida}. ¡Te esperamos!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 10px;">
          <h1 style="color: #059669; text-align: center;">¡Pago Recibido y Reserva Confirmada!</h1>
          <p>Hola <strong>${clienteNombre}</strong>,</p>
          <p>Nos alegra informarte que hemos validado tu comprobante de pago exitosamente.</p>
          <p>Tu reserva en <strong>Glamping Los Bosques</strong> ya es oficial y estamos listos para recibirte.</p>
          
          <div style="background-color: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #166534;">Detalles de tu estadía:</h3>
            <ul style="list-style: none; padding-left: 0;">
              <li>📅 <strong>Llegada:</strong> ${llegada}</li>
              <li>📅 <strong>Salida:</strong> ${salida}</li>
            </ul>
          </div>
          
          <p>Si tienes alguna pregunta adicional antes de tu viaje, no dudes en contactarnos.</p>
          <p style="text-align: center; font-size: 18px; margin-top: 30px;">¡Te esperamos pronto!</p>
        </div>
      `
    });

    return response;
  } catch (error) {
    console.error('❌ Error enviando email de confirmación:', error);
    // No lanzamos el error para evitar que se cancele la confirmación de la reserva
    return null;
  }
}

export const sendAdminNotificationEmail = async (clienteNombre, llegada, salida) => {
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