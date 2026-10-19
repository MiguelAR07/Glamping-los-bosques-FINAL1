import pool from '../config/db.js';

// Variables de entorno (Render):
// WHATSAPP_TOKEN        -> token permanente del usuario del sistema (GlampingBot)
// WHATSAPP_PHONE_ID     -> identificador del número del bot
// WHATSAPP_ADMIN_PHONE  -> número(s) de la administradora, separados por coma (ej: 573103599065)
// WHATSAPP_LANG         -> idioma de las plantillas (por defecto "es")

const GRAPH_URL = 'https://graph.facebook.com/v21.0';
const PANEL_URL = 'https://panel.glampinglosbosques.com';

// Plantillas que deben existir y estar aprobadas en Meta.
// scripts/whatsapp_templates.js las crea automáticamente a partir de esta lista.
export const TEMPLATES = {
  reserva_recibida: {
    body: 'Hola {{1}}, ¡gracias por reservar en Glamping Los Bosques! 🏕️\nRegistramos tu reserva #{{2}}:\n• Plan: {{3}}\n• Llegada: {{4}}\n• Salida: {{5}}\n• Huéspedes: {{6}}\n• Servicios adicionales: {{7}}\n• Total: {{8}}\n• Anticipo: {{9}}\n• Saldo por pagar: {{10}}\nPara confirmar tu estadía recuerda subir tu comprobante de pago. Un administrador lo revisará pronto.',
    example: ['Ana Gómez', '245', 'Fin de Semana - Cabaña Bambú', 'sáb 25 oct, 3:00 p. m.', 'dom 26 oct, 1:00 p. m.', '2 adultos, 1 niño, 0 mascotas', 'Decoración Cumpleaños (Sencilla)', '$380.000', '$190.000', '$190.000']
  },
  reserva_confirmada: {
    body: 'Hola {{1}}, ¡tu reserva #{{2}} en Glamping Los Bosques está confirmada! ✅\n• Plan: {{3}}\n• Llegada: {{4}}\n• Salida: {{5}}\n• Total: {{6}}\n• Pagado: {{7}}\n• Saldo pendiente: {{8}}\nTe esperamos para que vivas una experiencia inolvidable en la naturaleza.',
    example: ['Ana Gómez', '245', 'Fin de Semana - Cabaña Bambú', 'sáb 25 oct, 3:00 p. m.', 'dom 26 oct, 1:00 p. m.', '$380.000', '$190.000', '$190.000']
  },
  reserva_rechazada: {
    body: 'Hola {{1}}, lamentamos informarte que tu reserva #{{2}} en Glamping Los Bosques fue rechazada.\nMotivo: {{3}}\nSi tienes dudas, escríbenos y con gusto te ayudamos.',
    example: ['Ana Gómez', '245', 'El comprobante de pago no es legible']
  },
  reserva_cancelada: {
    body: 'Hola {{1}}, tu reserva #{{2}} en Glamping Los Bosques fue cancelada.\nMotivo: {{3}}\nSi tienes preguntas, escríbenos y con gusto te ayudamos.',
    example: ['Ana Gómez', '245', 'Motivos de fuerza mayor']
  },
  reserva_reprogramada: {
    body: 'Hola {{1}}, tu reserva #{{2}} en Glamping Los Bosques fue reprogramada. 🗓️\n• Nueva llegada: {{3}}\n• Nueva salida: {{4}}\n¡Te esperamos!',
    example: ['Ana Gómez', '245', 'sáb 1 nov, 3:00 p. m.', 'dom 2 nov, 1:00 p. m.']
  },
  saldo_pendiente: {
    body: 'Hola {{1}}, te recordamos que tu reserva #{{2}} en Glamping Los Bosques tiene un saldo pendiente de {{3}}.\nLlegada: {{4}}\nRecuerda pagarlo antes de llegar. Puedes subir tu comprobante aquí: {{5}}\n¡Te esperamos!',
    example: ['Ana Gómez', '245', '$190.000', 'sáb 25 oct, 3:00 p. m.', `${PANEL_URL}/pagar-saldo/245`]
  },
  saldo_aprobado: {
    body: 'Hola {{1}}, validamos el pago del saldo de tu reserva #{{2}} en Glamping Los Bosques. ✅\nTu reserva quedó pagada por completo. ¡Te esperamos!',
    example: ['Ana Gómez', '245']
  },
  admin_nueva_reserva: {
    body: '🔔 Nueva reserva {{1}} #{{2}}\n• Cliente: {{3}} (doc. {{4}})\n• Celular: {{5}}\n• Plan: {{6}}\n• Llegada: {{7}}\n• Salida: {{8}}\n• Huéspedes: {{9}}\n• Servicios: {{10}}\n• Total: {{11}} · Saldo: {{12}}\nRevisa el panel de control para validarla.',
    example: ['desde la página web', '245', 'Ana Gómez', '1036123456', '3001234567', 'Fin de Semana - Cabaña Bambú', 'sáb 25 oct, 3:00 p. m.', 'dom 26 oct, 1:00 p. m.', '2 adultos, 1 niño, 0 mascotas', 'Ninguno', '$380.000', '$190.000']
  },
  admin_comprobante: {
    body: '📎 Se subió el comprobante de {{1}} de la reserva #{{2}} ({{3}}).\nMonto: {{4}}\nRevisa el panel de control para validarlo.',
    example: ['anticipo', '245', 'Ana Gómez', '$190.000']
  },
  admin_resumen_diario: {
    body: '📅 Reservas de hoy, {{1}}:\n• Llegadas: {{2}}\n• Salidas: {{3}}\n• Saldos pendientes: {{4}}\n¡Que tengas un buen día!',
    example: ['sábado 25 de octubre', '#245 Ana Gómez (Cabaña Bambú, 3:00 p. m.)', 'Ninguna', '#245 Ana Gómez: $190.000']
  }
};

// ---------- utilidades ----------

export const formatCOP = (val) => '$' + Math.round(Number(val) || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

export const formatFecha = (d) => d
  ? new Date(d).toLocaleString('es-CO', { timeZone: 'America/Bogota', weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true })
  : 'N/A';

// Meta no acepta saltos de línea ni más de 4 espacios seguidos dentro de un parámetro
const limpiarParam = (v) => {
  const s = String(v ?? '').replace(/[\r\n\t]+/g, ' ').replace(/ {2,}/g, ' ').trim();
  return (s || '-').slice(0, 900);
};

// Convierte el número del cliente al formato internacional (Colombia por defecto)
export const normalizarTelefono = (telefono) => {
  let digits = String(telefono || '').replace(/\D/g, '');
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (digits.length === 10 && digits.startsWith('3')) digits = '57' + digits;
  return digits.length >= 11 ? digits : null;
};

const adminPhones = () => String(process.env.WHATSAPP_ADMIN_PHONE || '')
  .split(',').map(normalizarTelefono).filter(Boolean);

const textoHuespedes = (r) => {
  const a = Number(r.adultos ?? 2), n = Number(r.ninos ?? 0), m = Number(r.mascotas ?? 0);
  return `${a} ${a === 1 ? 'adulto' : 'adultos'}, ${n} ${n === 1 ? 'niño' : 'niños'}, ${m} ${m === 1 ? 'mascota' : 'mascotas'}`;
};

// ---------- envío ----------

const postMessage = async (body) => {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;
  if (!token || !phoneId) {
    console.warn(`⚠️ WhatsApp no configurado. Simulación (${body.type}) a ${body.to}`);
    return null;
  }
  const response = await fetch(`${GRAPH_URL}/${phoneId}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ messaging_product: 'whatsapp', ...body }),
    signal: AbortSignal.timeout(10000)
  });
  const data = await response.json();
  if (!response.ok) {
    console.error(`❌ Error de Meta WhatsApp enviando a ${body.to}:`, JSON.stringify(data.error || data));
    return null;
  }
  return data;
};

export const sendTemplate = async (telefono, name, params = []) => {
  try {
    const to = normalizarTelefono(telefono);
    if (!to) {
      console.warn(`⚠️ WhatsApp "${name}" no enviado: teléfono inválido (${telefono})`);
      return null;
    }
    const data = await postMessage({
      to,
      type: 'template',
      template: {
        name,
        language: { code: process.env.WHATSAPP_LANG || 'es' },
        components: params.length
          ? [{ type: 'body', parameters: params.map(p => ({ type: 'text', text: limpiarParam(p) })) }]
          : []
      }
    });
    if (data) console.log(`✅ WhatsApp "${name}" enviado a ${to}`);
    return data;
  } catch (error) {
    console.error(`❌ Error enviando WhatsApp "${name}":`, error.message);
    return null;
  }
};

// Mensaje libre: solo funciona si la persona escribió al bot en las últimas 24 horas
export const sendText = async (telefono, texto) => {
  try {
    const to = normalizarTelefono(telefono);
    if (!to) return null;
    return await postMessage({ to, type: 'text', text: { body: String(texto).slice(0, 4096) } });
  } catch (error) {
    console.error('❌ Error enviando WhatsApp de texto:', error.message);
    return null;
  }
};

const sendToAdmins = async (name, params) => {
  const phones = adminPhones();
  if (!phones.length) {
    console.warn(`⚠️ WHATSAPP_ADMIN_PHONE no configurado. No se envió "${name}"`);
    return;
  }
  await Promise.all(phones.map(p => sendTemplate(p, name, params)));
};

// ---------- datos de la reserva ----------

export const getReservaResumen = async (reservaId) => {
  const result = await pool.query(`
    SELECT v.id, v.cliente, v."Celular" AS celular, v."Cédula" AS documento, v.paquete, v.cabana,
           v.llegada, v.salida, v.estado, v."Pago restante" AS pago_restante,
           v."Servicios adicionales" AS servicios, v.adultos, v.ninos, v.mascotas,
           COALESCE(f.total, f.subtotal, v.subtotal) AS total
    FROM vista_reservas v
    LEFT JOIN facturas f ON f.reserva_id = v.id
    WHERE v.id = $1
    LIMIT 1
  `, [reservaId]);
  if (!result.rows.length) return null;

  const r = result.rows[0];
  const total = Number(r.total) || 0;
  const saldo = Number(r.pago_restante) || 0;
  return {
    ...r,
    total,
    saldo,
    pagado: Math.max(0, total - saldo),
    // vista_reservas.paquete viene como "Tipo de plan - Reserva - Cabaña X"
    plan: [String(r.paquete || '').split(' - ')[0], r.cabana].filter(Boolean).join(' - ') || 'Reserva Glamping',
    llegadaTxt: formatFecha(r.llegada),
    salidaTxt: formatFecha(r.salida),
    huespedes: textoHuespedes(r),
    serviciosTxt: r.servicios || 'Ninguno'
  };
};

// Ejecuta una notificación sin bloquear ni romper el flujo principal
const enSegundoPlano = (nombre, fn) => {
  Promise.resolve().then(fn).catch(err => console.error(`❌ Error en notificación WhatsApp "${nombre}":`, err.message));
};

// ---------- notificaciones por evento ----------

export const notifyReservationReceived = (reservaId, { manual = false } = {}) => enSegundoPlano('reserva_recibida', async () => {
  const r = await getReservaResumen(reservaId);
  if (!r) return;

  await sendTemplate(r.celular, 'reserva_recibida', [
    r.cliente, r.id, r.plan, r.llegadaTxt, r.salidaTxt, r.huespedes, r.serviciosTxt,
    formatCOP(r.total), formatCOP(r.pagado), formatCOP(r.saldo)
  ]);

  await sendToAdmins('admin_nueva_reserva', [
    manual ? 'manual' : 'desde la página web', r.id, r.cliente, r.documento || 'N/A', r.celular || 'N/A',
    r.plan, r.llegadaTxt, r.salidaTxt, r.huespedes, r.serviciosTxt, formatCOP(r.total), formatCOP(r.saldo)
  ]);
});

export const notifyReceiptUploaded = (reservaId, tipo = 'anticipo') => enSegundoPlano('admin_comprobante', async () => {
  const r = await getReservaResumen(reservaId);
  if (!r) return;
  const monto = tipo === 'saldo' ? r.saldo : (r.total - r.saldo);
  await sendToAdmins('admin_comprobante', [tipo, r.id, r.cliente, formatCOP(monto)]);
});

export const notifyReservationConfirmed = (reservaId) => enSegundoPlano('reserva_confirmada', async () => {
  const r = await getReservaResumen(reservaId);
  if (!r) return;
  await sendTemplate(r.celular, 'reserva_confirmada', [
    r.cliente, r.id, r.plan, r.llegadaTxt, r.salidaTxt, formatCOP(r.total), formatCOP(r.pagado), formatCOP(r.saldo)
  ]);
});

export const notifyReservationRejected = (reservaId, motivo) => enSegundoPlano('reserva_rechazada', async () => {
  const r = await getReservaResumen(reservaId);
  if (!r) return;
  await sendTemplate(r.celular, 'reserva_rechazada', [r.cliente, r.id, motivo || 'No especificado']);
});

export const notifyReservationCancelled = (reservaId, motivo) => enSegundoPlano('reserva_cancelada', async () => {
  const r = await getReservaResumen(reservaId);
  if (!r) return;
  await sendTemplate(r.celular, 'reserva_cancelada', [r.cliente, r.id, motivo || 'Cancelación registrada por nuestro equipo']);
});

export const notifyReservationRescheduled = (reservaId) => enSegundoPlano('reserva_reprogramada', async () => {
  const r = await getReservaResumen(reservaId);
  if (!r) return;
  await sendTemplate(r.celular, 'reserva_reprogramada', [r.cliente, r.id, r.llegadaTxt, r.salidaTxt]);
});

export const notifyBalanceReminder = async (reservaId) => {
  const r = await getReservaResumen(reservaId);
  if (!r || r.saldo <= 0) return null;
  return sendTemplate(r.celular, 'saldo_pendiente', [
    r.cliente, r.id, formatCOP(r.saldo), r.llegadaTxt, `${PANEL_URL}/pagar-saldo/${r.id}`
  ]);
};

export const notifyBalanceApproved = (reservaId) => enSegundoPlano('saldo_aprobado', async () => {
  const r = await getReservaResumen(reservaId);
  if (!r) return;
  await sendTemplate(r.celular, 'saldo_aprobado', [r.cliente, r.id]);
});

// ---------- resumen diario para la administradora ----------

export const sendDailySummary = async () => {
  // llegada/salida se guardan como hora UTC sin zona horaria
  const hoy = `(NOW() AT TIME ZONE 'America/Bogota')::date`;
  const llegadas = await pool.query(`
    SELECT id, cliente, cabana, llegada FROM vista_reservas
    WHERE (llegada AT TIME ZONE 'UTC' AT TIME ZONE 'America/Bogota')::date = ${hoy} AND estado NOT IN ('Cancelada', 'Cancelado')
    ORDER BY llegada`);
  const salidas = await pool.query(`
    SELECT id, cliente, cabana FROM vista_reservas
    WHERE (salida AT TIME ZONE 'UTC' AT TIME ZONE 'America/Bogota')::date = ${hoy} AND estado NOT IN ('Cancelada', 'Cancelado')
    ORDER BY salida`);
  const saldos = await pool.query(`
    SELECT id, cliente, "Pago restante" AS saldo FROM vista_reservas
    WHERE (llegada AT TIME ZONE 'UTC' AT TIME ZONE 'America/Bogota')::date = ${hoy} AND estado NOT IN ('Cancelada', 'Cancelado')
      AND "Pago restante" > 0`);

  const hora = (d) => new Date(d).toLocaleTimeString('es-CO', { timeZone: 'America/Bogota', hour: 'numeric', minute: '2-digit', hour12: true });
  const lista = (rows, fmt) => rows.length ? rows.map(fmt).join(' | ') : 'Ninguna';
  const fecha = new Date().toLocaleDateString('es-CO', { timeZone: 'America/Bogota', weekday: 'long', day: 'numeric', month: 'long' });

  await sendToAdmins('admin_resumen_diario', [
    fecha,
    lista(llegadas.rows, r => `#${r.id} ${r.cliente} (${r.cabana || 'Cabaña'}, ${hora(r.llegada)})`),
    lista(salidas.rows, r => `#${r.id} ${r.cliente} (${r.cabana || 'Cabaña'})`),
    lista(saldos.rows, r => `#${r.id} ${r.cliente}: ${formatCOP(r.saldo)}`)
  ]);
};
