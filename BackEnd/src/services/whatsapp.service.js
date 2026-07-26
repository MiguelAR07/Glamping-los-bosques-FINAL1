// Se deben configurar estas variables de entorno en el panel de alojamiento (Render, etc.):
// WHATSAPP_TOKEN
// WHATSAPP_PHONE_ID
// WHATSAPP_ADMIN_PHONE

export const sendBalanceApprovedWhatsApp = async (telefono, clienteNombre) => {
  try {
    const token = process.env.WHATSAPP_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_ID;
    const cleanPhone = String(telefono || '').replace(/\D/g, '');

    if (!token || !phoneId) {
      console.warn("⚠️ Meta WhatsApp API no está configurada. Simulación WSP SALDO APROBADO a " + cleanPhone + ": Hola " + clienteNombre + ", el pago de tu saldo ha sido validado.");
      return;
    }

    const url = `https://graph.facebook.com/v19.0/${phoneId}/messages`;
    
    const body = {
      messaging_product: "whatsapp",
      to: cleanPhone,
      type: "template",
      template: {
        name: "saldo_aprobado",
        language: { code: "es" },
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: clienteNombre || "Cliente" }
            ]
          }
        ]
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
      console.log(`✅ WhatsApp de saldo aprobado enviado a ${cleanPhone} (Message ID: ${data.messages?.[0]?.id})`);
    } else {
      console.error(`❌ Error de la API de Meta WhatsApp:`, data);
    }
  } catch (error) {
    console.error('❌ Error ejecutando envío de WhatsApp de saldo aprobado:', error);
  }
};

export const sendReservationConfirmedWhatsApp = async (telefono, clienteNombre) => {
  try {
    const token = process.env.WHATSAPP_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_ID;
    const cleanPhone = String(telefono || '').replace(/\D/g, '');

    if (!token || !phoneId) {
      console.warn("⚠️ Meta WhatsApp API no está configurada. Simulación WSP CONFIRMACIÓN a " + cleanPhone + ": Hola " + clienteNombre + ", tu reserva ha sido confirmada.");
      return;
    }

    const url = `https://graph.facebook.com/v19.0/${phoneId}/messages`;
    
    const body = {
      messaging_product: "whatsapp",
      to: cleanPhone,
      type: "template",
      template: {
        name: "reserva_confirmada",
        language: { code: "es" },
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: clienteNombre || "Cliente" }
            ]
          }
        ]
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

export const sendAdminNotificationWhatsApp = async (clienteNombre, llegadaFormateada, salidaFormateada) => {
  try {
    const token = process.env.WHATSAPP_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_ID;
    const adminPhone = process.env.WHATSAPP_ADMIN_PHONE;

    const cleanPhone = String(adminPhone || '').replace(/\D/g, '');

    if (!token || !phoneId || !adminPhone) {
      console.warn("⚠️ Meta WhatsApp API o número de admin no configurado. Simulación WSP NOTIFICACIÓN ADMIN: Nueva reserva confirmada de " + clienteNombre);
      return;
    }

    const url = `https://graph.facebook.com/v19.0/${phoneId}/messages`;
    
    const body = {
      messaging_product: "whatsapp",
      to: cleanPhone,
      type: "template",
      template: {
        name: "nueva_reserva_admin",
        language: { code: "es" },
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: clienteNombre || "Cliente" }
            ]
          }
        ]
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
      console.log(`✅ WhatsApp de notificación enviado al ADMIN (${cleanPhone})`);
    } else {
      console.error(`❌ Error de la API de Meta WhatsApp enviando al ADMIN:`, data);
    }
  } catch (error) {
    console.error('❌ Error ejecutando envío de WhatsApp al ADMIN:', error);
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
      type: "template",
      template: {
        name: "reserva_rechazada",
        language: { code: "es" },
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: clienteNombre || "Cliente" },
              { type: "text", text: motivo || "No especificado" }
            ]
          }
        ]
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
      type: "template",
      template: {
        name: "reserva_reprogramada",
        language: { code: "es" },
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: clienteNombre || "Cliente" },
              { type: "text", text: llegada || "" },
              { type: "text", text: salida || "" }
            ]
          }
        ]
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
