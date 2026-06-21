import twilio from 'twilio';

// Se recomienza usar variables de entorno:
// TWILIO_ACCOUNT_SID
// TWILIO_AUTH_TOKEN
// TWILIO_PHONE_NUMBER

export const sendReservationConfirmedSMS = async (telefono, clienteNombre) => {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromPhone = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !fromPhone) {
      console.warn("⚠️ Twilio no está configurado. Simulación SMS CONFIRMACIÓN a " + telefono + ": Hola " + clienteNombre + ", tu reserva ha sido confirmada.");
      return;
    }

    const client = twilio(accountSid, authToken);

    const message = await client.messages.create({
      body: `¡Hola ${clienteNombre}! Tu comprobante de pago ha sido validado. Tu reserva en Glamping Los Bosques está confirmada. ¡Te esperamos!`,
      from: fromPhone,
      to: telefono
    });

    console.log(`✅ SMS de confirmación enviado a ${telefono} (SID: ${message.sid})`);
  } catch (error) {
    console.error('❌ Error enviando SMS de confirmación:', error);
  }
};

export const sendReservationRejectedSMS = async (telefono, clienteNombre, motivo) => {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromPhone = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !fromPhone) {
      console.warn("⚠️ Twilio no está configurado. Simulación SMS RECHAZO a " + telefono + ": Hola " + clienteNombre + ", tu reserva fue rechazada. Motivo: " + motivo);
      return;
    }

    const client = twilio(accountSid, authToken);

    const message = await client.messages.create({
      body: `Hola ${clienteNombre}, hemos tenido un problema con tu reserva en Glamping Los Bosques. La reserva ha sido rechazada por el siguiente motivo: ${motivo}. Por favor, contáctanos.`,
      from: fromPhone,
      to: telefono
    });

    console.log(`✅ SMS de rechazo enviado a ${telefono} (SID: ${message.sid})`);
  } catch (error) {
    console.error('❌ Error enviando SMS de rechazo:', error);
  }
};
