// Se deben configurar estas variables de entorno en el panel de alojamiento (Render, etc.):
// WHATSAPP_TOKEN
// WHATSAPP_PHONE_ID

export const sendReservationConfirmedWhatsApp = async (telefono, clienteNombre) => {
  try {
    const token = process.env.WHATSAPP_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_ID;

    // Asegurarnos de que el teléfono tenga el formato correcto (solo números)
    // Usualmente Meta requiere el código de país sin el símbolo '+'. Ej: 573001234567
    const cleanPhone = String(telefono || '').replace(/\D/g, '');

    if (!token || !phoneId) {
      console.warn("⚠️ Meta WhatsApp API no está configurada. Simulación WSP CONFIRMACIÓN a " + cleanPhone + ": Hola " + clienteNombre + ", tu reserva ha sido confirmada.");
      return;
    }

    const url = `https://graph.facebook.com/v19.0/${phoneId}/messages`;
    
    // Usaremos un mensaje de texto libre por ahora. 
    // Nota: Para enviar mensajes a clientes fuera de la ventana de 24 horas, debes usar un "template" aprobado por Meta.
    const body = {
      messaging_product: "whatsapp",
      to: cleanPhone,
      type: "text",
      text: {
        body: `¡Hola ${clienteNombre}! 🎉 Tu comprobante de pago ha sido validado exitosamente. Tu reserva en Glamping Los Bosques está 100% confirmada. ¡Te esperamos!`
      }
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(5000)
    });

    const data = await response.json();

    if (response.ok) {
      console.log(`✅ WhatsApp de confirmación enviado a ${cleanPhone} (Message ID: ${data.messages?.[0]?.id})`);
    } else {
      console.error(`❌ Error de la API de Meta WhatsApp:`, data);
    }
  } catch (error) {
    console.error('❌ Error ejecutando envío de WhatsApp de confirmación:', error);
  }
};

export const sendReservationRejectedWhatsApp = async (telefono, clienteNombre, motivo) => {
  try {
    const token = process.env.WHATSAPP_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_ID;

    const cleanPhone = String(telefono || '').replace(/\D/g, '');

    if (!token || !phoneId) {
      console.warn("⚠️ Meta WhatsApp API no está configurada. Simulación WSP RECHAZO a " + cleanPhone + ": Hola " + clienteNombre + ", tu reserva fue rechazada. Motivo: " + motivo);
      return;
    }

    const url = `https://graph.facebook.com/v19.0/${phoneId}/messages`;
    
    const body = {
      messaging_product: "whatsapp",
      to: cleanPhone,
      type: "text",
      text: {
        body: `Hola ${clienteNombre}. Hemos revisado tu comprobante de pago pero hemos tenido un problema. Tu reserva ha sido rechazada por el siguiente motivo: ${motivo}. Por favor, contáctanos lo más pronto posible para solucionarlo.`
      }
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(5000)
    });

    const data = await response.json();

    if (response.ok) {
      console.log(`✅ WhatsApp de rechazo enviado a ${cleanPhone}`);
    } else {
      console.error(`❌ Error de la API de Meta WhatsApp:`, data);
    }
  } catch (error) {
    console.error('❌ Error ejecutando envío de WhatsApp de rechazo:', error);
  }
};

export const sendRescheduleWhatsApp = async (telefono, clienteNombre, llegada, salida) => {
  try {
    const token = process.env.WHATSAPP_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_ID;

    const cleanPhone = String(telefono || '').replace(/\D/g, '');

    if (!token || !phoneId) {
      console.warn("⚠️ Meta WhatsApp API no está configurada. Simulación WSP REPROGRAMACIÓN a " + cleanPhone);
      return;
    }

    const url = `https://graph.facebook.com/v19.0/${phoneId}/messages`;
    
    const body = {
      messaging_product: "whatsapp",
      to: cleanPhone,
      type: "text",
      text: {
        body: `¡Hola ${clienteNombre}! 📅 Te confirmamos que tu reserva en Glamping Los Bosques ha sido reprogramada con éxito. Tus nuevas fechas son:\n\nLlegada: ${llegada}\nSalida: ${salida}\n\n¡Te esperamos con los brazos abiertos!`
      }
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(5000)
    });

    const data = await response.json();

    if (response.ok) {
      console.log(`✅ WhatsApp de reprogramación enviado a ${cleanPhone}`);
    } else {
      console.error(`❌ Error de la API de Meta WhatsApp:`, data);
    }
  } catch (error) {
    console.error('❌ Error ejecutando envío de WhatsApp de reprogramación:', error);
  }
};
