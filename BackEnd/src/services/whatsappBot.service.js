import Anthropic from '@anthropic-ai/sdk';
import cloudinary from 'cloudinary';
import pool from '../config/db.js';
import { createReservation, updateReservation } from '../controllers/reservation.controller.js';
import { sendText, normalizarTelefono, formatCOP, formatFecha } from './whatsapp.service.js';

// Bot de WhatsApp para la administradora: crea, consulta y edita reservas escribiendo en lenguaje natural.
// Variables de entorno:
// ANTHROPIC_API_KEY     -> clave de la API de Claude
// WHATSAPP_ADMIN_PHONE  -> números autorizados para usar el bot (separados por coma)

const MODEL = 'claude-opus-5-5';
const MAX_VUELTAS = 8;
const SESION_HORAS = 12;
const SESION_MAX_BYTES = 250_000;

// Se crea al primer uso para que el servidor arranque aunque falte ANTHROPIC_API_KEY
let anthropic = null;
cloudinary.v2.config();

const adminPhones = () => String(process.env.WHATSAPP_ADMIN_PHONE || '')
  .split(',').map(normalizarTelefono).filter(Boolean);

// ---------- sesión (conversación por teléfono) ----------

let tablaLista = false;
const asegurarTabla = async () => {
  if (tablaLista) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS whatsapp_bot_sesiones (
      telefono VARCHAR(20) PRIMARY KEY,
      historial JSONB NOT NULL DEFAULT '[]',
      pendiente JSONB,
      comprobante_url TEXT,
      actualizado TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`);
  tablaLista = true;
};

const cargarSesion = async (telefono) => {
  await asegurarTabla();
  const { rows } = await pool.query('SELECT * FROM whatsapp_bot_sesiones WHERE telefono = $1', [telefono]);
  const s = rows[0];
  if (!s) return { telefono, historial: [], pendiente: null, comprobante_url: null };
  const vencida = Date.now() - new Date(s.actualizado).getTime() > SESION_HORAS * 3600 * 1000;
  // Si la conversación es vieja o muy larga se empieza de cero (se conserva la acción pendiente)
  const muyLarga = JSON.stringify(s.historial).length > SESION_MAX_BYTES;
  // Una vuelta interrumpida (tool_use sin tool_result) no se puede continuar
  const ultimo = s.historial[s.historial.length - 1];
  const colgada = ultimo?.role === 'assistant' && Array.isArray(ultimo.content) && ultimo.content.some(b => b.type === 'tool_use');
  return {
    telefono,
    historial: vencida || muyLarga || colgada ? [] : s.historial,
    pendiente: vencida ? null : s.pendiente,
    comprobante_url: vencida ? null : s.comprobante_url
  };
};

const guardarSesion = async (s) => {
  await pool.query(`
    INSERT INTO whatsapp_bot_sesiones (telefono, historial, pendiente, comprobante_url, actualizado)
    VALUES ($1, $2, $3, $4, NOW())
    ON CONFLICT (telefono) DO UPDATE
      SET historial = $2, pendiente = $3, comprobante_url = $4, actualizado = NOW()`,
    [s.telefono, JSON.stringify(s.historial), s.pendiente ? JSON.stringify(s.pendiente) : null, s.comprobante_url]);
};

// ---------- utilidades ----------

const HORAS_PLAN = (tipo = '') => {
  const t = tipo.toLowerCase();
  if (t.includes('ocasional')) return { entrada: '08:00', salida: '14:00' };
  if (t.includes('sol')) return { entrada: '10:00', salida: '17:00' };
  return { entrada: '15:00', salida: '13:00' };
};

const esFecha = (s) => /^\d{4}-\d{2}-\d{2}$/.test(String(s || ''));

// llegada/salida se guardan como hora UTC sin zona horaria: convertir la hora de Colombia a UTC
const aUTC = (fecha, hora) => new Date(`${fecha}T${hora}:00-05:00`).toISOString();
const aDbUTC = (fecha, hora) => aUTC(fecha, hora).replace('T', ' ').slice(0, 19);

// Ejecuta un controlador de Express sin pasar por HTTP y devuelve su respuesta
const llamarControlador = (controlador, req) => new Promise((resolve, reject) => {
  const res = {
    statusCode: 200,
    status(code) { this.statusCode = code; return this; },
    json(body) { resolve({ status: this.statusCode, body }); return this; }
  };
  Promise.resolve(controlador({ params: {}, headers: {}, ...req }, res)).catch(reject);
});

const obtenerPaquete = async (paqueteId) => {
  const { rows } = await pool.query(`
    SELECT p.paquete_id, p.cabana_id, p.tipo_id, c.nombre AS cabana, tp.nombre AS tipo, v.precio
    FROM paquetes p
    JOIN cabanas c ON c.cabana_id = p.cabana_id
    JOIN tipo_paquete tp ON tp.tipo_id = p.tipo_id
    LEFT JOIN vista_paquetes v ON v.id = p.paquete_id
    WHERE p.paquete_id = $1`, [paqueteId]);
  return rows[0] || null;
};

const reservasQueChocan = async (cabanaId, llegada, salida, excluirId = null) => {
  const { rows } = await pool.query(`
    SELECT r.reserva_id FROM reservas r JOIN paquetes p ON p.paquete_id = r.paquete_id
    WHERE p.cabana_id = $1 AND r.estado NOT IN ('Cancelado', 'Cancelada')
      AND r.llegada < $3 AND r.salida > $2 AND ($4::int IS NULL OR r.reserva_id <> $4)`,
    [cabanaId, llegada, salida, excluirId]);
  return rows.map(r => r.reserva_id);
};

const reservasDelDia = async (llegada, salida, excluirId = null) => {
  const { rows } = await pool.query(`
    SELECT id, cliente, cabana, llegada, salida FROM vista_reservas
    WHERE estado NOT IN ('Cancelado', 'Cancelada') AND llegada < $2 AND salida > $1
      AND ($3::int IS NULL OR id <> $3)
    ORDER BY llegada`, [llegada, salida, excluirId]);
  return rows.map(r => `#${r.id} ${r.cliente} (${r.cabana}, ${formatFecha(r.llegada)} → ${formatFecha(r.salida)})`);
};

// ---------- herramientas que puede usar Claude ----------

const nullable = (type, description) => ({ type: [type, 'null'], description });

const TOOLS = [
  {
    name: 'consultar_catalogo',
    description: 'Lista las cabañas, los planes (paquetes) disponibles con su precio y los servicios adicionales con su precio. Úsala antes de preparar una reserva para obtener paquete_id y servicio_id.',
    strict: true,
    input_schema: { type: 'object', properties: {}, required: [], additionalProperties: false }
  },
  {
    name: 'consultar_reservas',
    description: 'Lista las reservas activas que se cruzan con un rango de fechas (incluye llegadas, salidas y estadías en curso).',
    strict: true,
    input_schema: {
      type: 'object',
      properties: {
        desde: { type: 'string', description: 'Fecha inicial YYYY-MM-DD' },
        hasta: { type: 'string', description: 'Fecha final YYYY-MM-DD (inclusive)' }
      },
      required: ['desde', 'hasta'],
      additionalProperties: false
    }
  },
  {
    name: 'buscar_reserva',
    description: 'Busca reservas por número de reserva, nombre del cliente, documento o celular. Devuelve el detalle completo.',
    strict: true,
    input_schema: {
      type: 'object',
      properties: { texto: { type: 'string', description: 'Número de reserva, nombre, documento o celular' } },
      required: ['texto'],
      additionalProperties: false
    }
  },
  {
    name: 'preparar_reserva',
    description: 'Valida los datos de una reserva nueva, revisa disponibilidad y la deja PENDIENTE de confirmación. No la crea: la administradora debe responder SÍ. Si ella envió un comprobante en el chat, se adjunta automáticamente.',
    strict: true,
    input_schema: {
      type: 'object',
      properties: {
        cliente_nombre: { type: 'string' },
        tipo_documento: { type: 'string', enum: ['CC', 'CE', 'TI', 'PASAPORTE', 'NIT'] },
        numero_documento: nullable('string', 'Número de documento, null si no se dio'),
        celular: { type: 'string', description: 'Celular del cliente' },
        email: nullable('string', 'Correo del cliente, null si no se dio'),
        paquete_id: { type: 'integer', description: 'paquete_id obtenido de consultar_catalogo' },
        fecha_llegada: { type: 'string', description: 'YYYY-MM-DD' },
        fecha_salida: { type: 'string', description: 'YYYY-MM-DD (igual a la llegada en planes de un solo día)' },
        adultos: { type: 'integer', description: 'Personas mayores de 3 años' },
        ninos: { type: 'integer', description: 'Niños menores de 3 años' },
        mascotas: { type: 'integer' },
        servicios_ids: { type: 'array', items: { type: 'integer' }, description: 'servicio_id de los servicios adicionales' },
        total: { type: 'number', description: 'Valor total de la estadía en pesos' },
        abono: { type: 'number', description: 'Lo que el cliente ya pagó en pesos (0 si nada)' },
        descuento_porcentaje: { type: 'number', description: 'Descuento en porcentaje (0 si no hay)' }
      },
      required: ['cliente_nombre', 'tipo_documento', 'numero_documento', 'celular', 'email', 'paquete_id', 'fecha_llegada', 'fecha_salida', 'adultos', 'ninos', 'mascotas', 'servicios_ids', 'total', 'abono', 'descuento_porcentaje'],
      additionalProperties: false
    }
  },
  {
    name: 'preparar_edicion',
    description: 'Prepara cambios a una reserva existente y los deja PENDIENTES de confirmación (la administradora debe responder SÍ). Usa null en todo lo que no cambia. Si ella envió un comprobante en el chat y adjuntar_comprobante es true, se guarda en la reserva.',
    strict: true,
    input_schema: {
      type: 'object',
      properties: {
        reserva_id: { type: 'integer' },
        fecha_llegada: nullable('string', 'YYYY-MM-DD'),
        fecha_salida: nullable('string', 'YYYY-MM-DD'),
        adultos: nullable('integer'),
        ninos: nullable('integer'),
        mascotas: nullable('integer'),
        cliente_nombre: nullable('string'),
        celular: nullable('string'),
        email: nullable('string'),
        numero_documento: nullable('string'),
        total: nullable('number', 'Nuevo valor total en pesos'),
        total_abonado: nullable('number', 'Total pagado hasta ahora en pesos'),
        servicios_ids: { type: ['array', 'null'], items: { type: 'integer' }, description: 'Lista COMPLETA de servicios adicionales que debe quedar' },
        adjuntar_comprobante: { type: 'boolean' }
      },
      required: ['reserva_id', 'fecha_llegada', 'fecha_salida', 'adultos', 'ninos', 'mascotas', 'cliente_nombre', 'celular', 'email', 'numero_documento', 'total', 'total_abonado', 'servicios_ids', 'adjuntar_comprobante'],
      additionalProperties: false
    }
  }
];

export const herramientas = {
  async consultar_catalogo() {
    const cabanas = await pool.query(`SELECT cabana_id, nombre, precio_noche, capacidad_personas FROM cabanas WHERE estado ILIKE 'activo' ORDER BY cabana_id`);
    // Un plan por tipo y cabaña: el más reciente, igual que el panel
    const paquetes = await pool.query(`
      SELECT DISTINCT ON (p.tipo_id, p.cabana_id) p.paquete_id, tp.nombre AS plan, c.nombre AS cabana, v.precio
      FROM paquetes p
      JOIN tipo_paquete tp ON tp.tipo_id = p.tipo_id
      JOIN cabanas c ON c.cabana_id = p.cabana_id
      LEFT JOIN vista_paquetes v ON v.id = p.paquete_id
      WHERE p.estado ILIKE 'activo'
      ORDER BY p.tipo_id, p.cabana_id, p.fecha_registro DESC NULLS LAST, p.paquete_id DESC`);
    const servicios = await pool.query(`SELECT id AS servicio_id, servicio, precio FROM vista_servicios WHERE estado = 'Activo' ORDER BY id`);
    return {
      cabanas: cabanas.rows,
      paquetes: paquetes.rows.map(p => ({ ...p, horario: HORAS_PLAN(p.plan) })),
      servicios: servicios.rows
    };
  },

  async consultar_reservas({ desde, hasta }) {
    if (!esFecha(desde) || !esFecha(hasta)) return { error: 'Fechas inválidas, usa YYYY-MM-DD' };
    const { rows } = await pool.query(`
      SELECT id, cliente, "Celular" AS celular, cabana, paquete, llegada, salida, estado, "Pago restante" AS saldo
      FROM vista_reservas
      WHERE estado NOT IN ('Cancelado', 'Cancelada')
        AND (llegada AT TIME ZONE 'UTC' AT TIME ZONE 'America/Bogota')::date <= $2::date
        AND (salida AT TIME ZONE 'UTC' AT TIME ZONE 'America/Bogota')::date >= $1::date
      ORDER BY llegada LIMIT 50`, [desde, hasta]);
    return rows.map(r => ({ ...r, llegada: formatFecha(r.llegada), salida: formatFecha(r.salida), saldo: formatCOP(r.saldo) }));
  },

  async buscar_reserva({ texto }) {
    const t = String(texto || '').trim().replace(/^#/, '');
    const { rows } = await pool.query(`
      SELECT * FROM vista_reservas
      WHERE ($1 ~ '^\\d{1,6}$' AND id = $1::int)
         OR cliente ILIKE '%' || $1 || '%' OR "Cédula" ILIKE '%' || $1 || '%' OR "Celular" ILIKE '%' || $1 || '%'
      ORDER BY llegada DESC LIMIT 5`, [t]);
    return rows.map(r => ({
      id: r.id, cliente: r.cliente, documento: r['Cédula'], celular: r.Celular, cabana: r.cabana, plan: r.paquete,
      llegada: formatFecha(r.llegada), salida: formatFecha(r.salida), estado: r.estado,
      adultos: r.adultos, ninos: r.ninos, mascotas: r.mascotas, servicios: r['Servicios adicionales'] || 'Ninguno',
      total: formatCOP(r.subtotal), abonado: formatCOP(r['Total abonado']), saldo: formatCOP(r['Pago restante']),
      tiene_comprobante: Boolean(r.comprobante_url)
    }));
  },

  async preparar_reserva(d, sesion) {
    const paquete = await obtenerPaquete(d.paquete_id);
    if (!paquete) return { error: `No existe el paquete ${d.paquete_id}. Usa consultar_catalogo.` };
    if (!esFecha(d.fecha_llegada) || !esFecha(d.fecha_salida)) return { error: 'Fechas inválidas, usa YYYY-MM-DD' };

    const horas = HORAS_PLAN(paquete.tipo);
    const llegada = aUTC(d.fecha_llegada, horas.entrada);
    const salida = aUTC(d.fecha_salida, horas.salida);
    if (new Date(salida) <= new Date(llegada)) return { error: 'La salida debe ser posterior a la llegada.' };

    const choques = await reservasQueChocan(paquete.cabana_id, llegada, salida);
    if (choques.length) return { error: `La ${paquete.cabana} ya está ocupada en esas fechas (reserva ${choques.map(c => '#' + c).join(', ')}). Pregunta por otra cabaña o fecha.` };

    const totalNeto = d.total * (1 - (d.descuento_porcentaje || 0) / 100);
    const saldo = Math.max(0, totalNeto - (d.abono || 0));
    const otras = await reservasDelDia(llegada, salida);

    let serviciosTxt = 'Ninguno';
    if (d.servicios_ids.length) {
      const { rows } = await pool.query('SELECT servicio FROM vista_servicios WHERE id = ANY($1::int[])', [d.servicios_ids]);
      serviciosTxt = rows.map(r => r.servicio).join(', ');
    }

    const noches = Math.max(0, Math.round((new Date(`${d.fecha_salida}T00:00:00Z`) - new Date(`${d.fecha_llegada}T00:00:00Z`)) / 86400000));
    sesion.pendiente = {
      tipo: 'crear', datos: d, llegada, salida,
      // Paquete propio para esta reserva (como la página web) para no alterar paquetes compartidos
      paquete: { cabana_id: paquete.cabana_id, tipo_id: paquete.tipo_id, dias_estadia: noches, nombre: `Reserva - ${paquete.cabana}`, descripcion: `Reserva por WhatsApp - ${paquete.tipo}` }
    };
    return {
      estado: 'PENDIENTE DE CONFIRMACIÓN',
      resumen: {
        cliente: `${d.cliente_nombre} (${d.tipo_documento} ${d.numero_documento || 'sin documento'})`,
        celular: d.celular, email: d.email || 'sin correo',
        plan: `${paquete.tipo} - ${paquete.cabana}`,
        llegada: formatFecha(llegada), salida: formatFecha(salida),
        huespedes: `${d.adultos} adultos, ${d.ninos} niños, ${d.mascotas} mascotas`,
        servicios: serviciosTxt,
        total: formatCOP(totalNeto), abonado: formatCOP(d.abono), saldo: formatCOP(saldo),
        comprobante: sesion.comprobante_url ? 'adjunto' : 'sin comprobante'
      },
      otras_reservas_esos_dias: otras.length ? otras : 'Ninguna',
      siguiente_paso: 'Muestra el resumen y pide que responda SÍ para crearla o NO para descartarla.'
    };
  },

  async preparar_edicion(d, sesion) {
    const actual = (await pool.query('SELECT * FROM vista_reservas WHERE id = $1', [d.reserva_id])).rows[0];
    if (!actual) return { error: `No existe la reserva #${d.reserva_id}` };
    if ((d.fecha_llegada && !esFecha(d.fecha_llegada)) || (d.fecha_salida && !esFecha(d.fecha_salida))) return { error: 'Fechas inválidas, usa YYYY-MM-DD' };
    if (d.adjuntar_comprobante && !sesion.comprobante_url) return { error: 'No hay comprobante en el chat. Pide que envíe la foto primero.' };

    const horas = HORAS_PLAN(actual.paquete);
    const nuevaLlegada = d.fecha_llegada ? aUTC(d.fecha_llegada, horas.entrada) : new Date(actual.llegada).toISOString();
    const nuevaSalida = d.fecha_salida ? aUTC(d.fecha_salida, horas.salida) : new Date(actual.salida).toISOString();

    const cambios = [];
    if (d.fecha_llegada || d.fecha_salida) {
      if (new Date(nuevaSalida) <= new Date(nuevaLlegada)) return { error: 'La salida debe ser posterior a la llegada.' };
      const choques = await reservasQueChocan(actual.cabana_id, nuevaLlegada, nuevaSalida, actual.id);
      if (choques.length) return { error: `La ${actual.cabana} ya está ocupada en esas fechas (reserva ${choques.map(c => '#' + c).join(', ')}).` };
      cambios.push(`Fechas: ${formatFecha(actual.llegada)} → ${formatFecha(actual.salida)}  ⟶  ${formatFecha(nuevaLlegada)} → ${formatFecha(nuevaSalida)}`);
    }
    for (const [campo, etiqueta, anterior] of [
      ['adultos', 'Adultos', actual.adultos], ['ninos', 'Niños', actual.ninos], ['mascotas', 'Mascotas', actual.mascotas],
      ['cliente_nombre', 'Nombre', actual.cliente], ['celular', 'Celular', actual.Celular],
      ['numero_documento', 'Documento', actual['Cédula']], ['email', 'Correo', '']
    ]) {
      if (d[campo] !== null && d[campo] !== undefined) cambios.push(`${etiqueta}: ${anterior ?? '-'} → ${d[campo]}`);
    }
    const total = d.total ?? Number(actual.subtotal);
    const abonado = d.total_abonado ?? Number(actual['Total abonado']);
    if (d.total !== null) cambios.push(`Total: ${formatCOP(actual.subtotal)} → ${formatCOP(d.total)}`);
    if (d.total_abonado !== null) cambios.push(`Abonado: ${formatCOP(actual['Total abonado'])} → ${formatCOP(d.total_abonado)}`);
    if (d.total !== null || d.total_abonado !== null) cambios.push(`Saldo quedaría: ${formatCOP(Math.max(0, total - abonado))}`);
    if (d.servicios_ids) {
      const { rows } = await pool.query('SELECT servicio FROM vista_servicios WHERE id = ANY($1::int[])', [d.servicios_ids]);
      cambios.push(`Servicios: ${actual['Servicios adicionales'] || 'Ninguno'} → ${rows.map(r => r.servicio).join(', ') || 'Ninguno'}`);
    }
    if (d.adjuntar_comprobante) cambios.push('Adjuntar el comprobante enviado en el chat');
    if (!cambios.length) return { error: 'No hay cambios que aplicar.' };

    sesion.pendiente = {
      tipo: 'editar', datos: d,
      // Sin 'T' para que updateReservation respete la hora exacta
      llegadaDb: d.fecha_llegada ? aDbUTC(d.fecha_llegada, horas.entrada) : null,
      salidaDb: d.fecha_salida ? aDbUTC(d.fecha_salida, horas.salida) : null
    };
    return {
      estado: 'PENDIENTE DE CONFIRMACIÓN',
      reserva: `#${actual.id} ${actual.cliente}`,
      cambios,
      siguiente_paso: 'Muestra los cambios y pide que responda SÍ para aplicarlos o NO para descartarlos.'
    };
  }
};

// ---------- ejecutar acciones confirmadas ----------

const ejecutarPendiente = async (sesion) => {
  const p = sesion.pendiente;

  if (p.tipo === 'crear') {
    const d = p.datos;
    const totalNeto = d.total * (1 - (d.descuento_porcentaje || 0) / 100);
    const { status, body } = await llamarControlador(createReservation, {
      headers: { authorization: 'whatsapp-bot' },
      file: sesion.comprobante_url ? { path: sesion.comprobante_url } : undefined,
      body: {
        cliente: {
          nombre: d.cliente_nombre,
          email: d.email || 'no-reply@glamping.com',
          contacto: d.celular,
          tipo_identificacion: d.tipo_documento,
          numero_identificacion: d.numero_documento || `RES-${Date.now()}`,
          pais_residencia: 'Colombia'
        },
        paquete: p.paquete,
        reserva: {
          llegada: p.llegada,
          salida: p.salida,
          por_pagar: Math.max(0, Math.round(totalNeto - (d.abono || 0))),
          adultos: d.adultos, ninos: d.ninos, mascotas: d.mascotas
        },
        factura: { subtotal: d.total, descuento: d.descuento_porcentaje || 0 },
        servicios: d.servicios_ids.map(id => ({ servicio_id: id }))
      }
    });
    if (status >= 300 || !body.success) return `❌ No se pudo crear la reserva: ${body.message || 'error desconocido'}`;
    return `✅ Reserva #${body.reserva_id} creada para ${d.cliente_nombre}. Ya aparece en el panel${sesion.comprobante_url ? ' con el comprobante adjunto' : ''}.`;
  }

  if (p.tipo === 'editar') {
    const d = p.datos;
    const body = {
      llegada: p.llegadaDb || undefined,
      salida: p.salidaDb || undefined,
      adultos: d.adultos ?? undefined, ninos: d.ninos ?? undefined, mascotas: d.mascotas ?? undefined,
      cliente_nombre: d.cliente_nombre || undefined, cliente_contacto: d.celular || undefined,
      cliente_email: d.email || undefined, cliente_cedula: d.numero_documento || undefined,
      subtotal: d.total ?? undefined,
      total_abonado: d.total_abonado ?? undefined,
      servicios: d.servicios_ids ? d.servicios_ids.map(id => ({ servicio_id: id })) : undefined
    };
    if (d.total !== null || d.total_abonado !== null) {
      const actual = (await pool.query('SELECT subtotal, "Total abonado" AS abonado FROM vista_reservas WHERE id = $1', [d.reserva_id])).rows[0];
      body.por_pagar = Math.max(0, (d.total ?? Number(actual.subtotal)) - (d.total_abonado ?? Number(actual.abonado)));
    }
    const { status, body: r } = await llamarControlador(updateReservation, {
      params: { id: d.reserva_id },
      file: d.adjuntar_comprobante && sesion.comprobante_url ? { path: sesion.comprobante_url } : undefined,
      body
    });
    if (status >= 300 || !r.success) return `❌ No se pudo actualizar la reserva #${d.reserva_id}: ${r.message || 'error desconocido'}`;
    return `✅ Reserva #${d.reserva_id} actualizada. Los cambios ya se ven en el panel.`;
  }

  return 'No había nada pendiente.';
};

// ---------- Claude ----------

const SYSTEM = `Eres el asistente interno de reservas de Glamping Los Bosques (Marinilla, Antioquia). Hablas por WhatsApp con la administradora: responde en español, corto y claro, con formato de WhatsApp (*negrita*, listas con •). Nunca uses tablas ni markdown de encabezados.

Puedes:
• Crear reservas manuales: reúne nombre, documento, celular, plan (cabaña + tipo de plan), fechas, número de personas (adultos = mayores de 3 años, niños = menores de 3 años, mascotas), servicios adicionales, valor total y lo abonado. Usa consultar_catalogo para obtener paquete_id, servicio_id y precios. Si ella no dice el total, propón el precio del plan más los servicios y pide que lo confirme. Si falta un dato obligatorio, pregúntalo; el correo y el documento son opcionales.
• Avisar si ese día ya hay otras reservas (preparar_reserva lo devuelve) y si la cabaña está ocupada.
• Consultar reservas por fecha (consultar_reservas) o buscar una reserva (buscar_reserva).
• Corregir reservas (preparar_edicion).

Reglas:
• Nunca digas que una reserva fue creada o modificada: solo la dejas pendiente con preparar_reserva o preparar_edicion, y el sistema la ejecuta cuando ella responde SÍ.
• Las fechas que te den sin año son del año en curso o del siguiente si ya pasaron. Interpreta "hoy", "mañana", "el sábado" con la fecha actual que llega en cada mensaje.
• Cuando ella envíe una foto de un comprobante, léela para identificar el monto pagado y úsalo como abono si corresponde.
• Si una herramienta devuelve error, explícaselo y pregunta cómo seguir.
• No inventes reservas, precios ni datos: consulta siempre las herramientas.`;

const preguntarAClaude = async (sesion) => {
  if (!process.env.ANTHROPIC_API_KEY) return '⚠️ El bot todavía no tiene configurada la clave de Claude (ANTHROPIC_API_KEY).';
  anthropic ??= new Anthropic();
  for (let vuelta = 0; vuelta < MAX_VUELTAS; vuelta++) {
    const response = await anthropic.beta.messages.create({
      model: MODEL,
      max_tokens: 16000,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      output_config: { effort: 'medium' },
      system: SYSTEM,
      tools: TOOLS,
      messages: sesion.historial
    });

    if (response.stop_reason === 'refusal') {
      return 'No pude procesar ese mensaje. ¿Me lo puedes escribir de otra forma?';
    }

    sesion.historial.push({ role: 'assistant', content: response.content });

    const llamadas = response.content.filter(b => b.type === 'tool_use');
    if (response.stop_reason !== 'tool_use' || !llamadas.length) {
      const texto = response.content.filter(b => b.type === 'text').map(b => b.text).join('\n').trim();
      return texto || 'Listo.';
    }

    const resultados = [];
    for (const llamada of llamadas) {
      let contenido;
      try {
        const fn = herramientas[llamada.name];
        contenido = fn ? await fn(llamada.input, sesion) : { error: `Herramienta desconocida: ${llamada.name}` };
      } catch (error) {
        console.error(`❌ Error en herramienta ${llamada.name}:`, error);
        contenido = { error: error.message };
      }
      resultados.push({
        type: 'tool_result',
        tool_use_id: llamada.id,
        content: JSON.stringify(contenido),
        is_error: Boolean(contenido?.error)
      });
    }
    sesion.historial.push({ role: 'user', content: resultados });
  }
  return 'Me enredé con ese mensaje. ¿Me das los datos otra vez, por favor?';
};

// ---------- comprobantes (fotos o PDF) ----------

const descargarYSubirMedia = async (mediaId, mime) => {
  const token = process.env.WHATSAPP_TOKEN;
  const meta = await fetch(`https://graph.facebook.com/v21.0/${mediaId}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json());
  if (!meta.url) throw new Error('No se pudo obtener el archivo de WhatsApp');
  const archivo = await fetch(meta.url, { headers: { Authorization: `Bearer ${token}` } });
  const base64 = Buffer.from(await archivo.arrayBuffer()).toString('base64');
  const subido = await cloudinary.v2.uploader.upload(`data:${mime || meta.mime_type};base64,${base64}`, {
    folder: 'comprobantes',
    resource_type: 'auto'
  });
  return subido.secure_url;
};

// ---------- entrada principal (desde el webhook) ----------

const procesados = new Set();
const CONFIRMA = /^\s*(s[ií]|si+|confirmo|confirmar|dale|ok|listo|hágale|hagale)\s*[.!👍✅]*\s*$/i;
const CANCELA = /^\s*(no|cancela|cancelar|descarta|descartar)\s*[.!]*\s*$/i;

const fechaActual = () => new Date().toLocaleString('es-CO', {
  timeZone: 'America/Bogota', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit'
});

export const handleIncomingMessage = async (msg) => {
  if (!msg?.id || procesados.has(msg.id)) return; // Meta reintenta los webhooks
  procesados.add(msg.id);
  if (procesados.size > 1000) procesados.delete(procesados.values().next().value);

  const telefono = normalizarTelefono(msg.from);
  if (!adminPhones().includes(telefono)) {
    await sendText(telefono, 'Hola 👋 Este número es solo para uso interno de Glamping Los Bosques. Para reservas o información escríbenos al +57 310 359 9065. ¡Gracias!');
    return;
  }

  const sesion = await cargarSesion(telefono);

  try {
    const texto = (msg.text?.body || msg.image?.caption || msg.document?.caption || '').trim();

    // Confirmaciones de acciones pendientes: las ejecuta el sistema, no la IA
    if (sesion.pendiente && msg.type === 'text' && CONFIRMA.test(texto)) {
      const resultado = await ejecutarPendiente(sesion);
      if (resultado.startsWith('✅')) {
        sesion.pendiente = null;
        sesion.comprobante_url = null;
      }
      sesion.historial.push({ role: 'user', content: texto }, { role: 'assistant', content: resultado });
      await sendText(telefono, resultado);
      return;
    }
    if (sesion.pendiente && msg.type === 'text' && CANCELA.test(texto)) {
      sesion.pendiente = null;
      const respuesta = 'Listo, lo descarté. No se guardó nada. 👍';
      sesion.historial.push({ role: 'user', content: texto }, { role: 'assistant', content: respuesta });
      await sendText(telefono, respuesta);
      return;
    }

    const contenido = [{ type: 'text', text: `[Fecha y hora actual: ${fechaActual()}]` }];

    if (msg.type === 'image' || msg.type === 'document') {
      const media = msg.image || msg.document;
      sesion.comprobante_url = await descargarYSubirMedia(media.id, media.mime_type);
      if (msg.type === 'image') {
        contenido.push({ type: 'image', source: { type: 'url', url: sesion.comprobante_url } });
      }
      contenido.push({ type: 'text', text: `La administradora envió un comprobante de pago${msg.type === 'document' ? ' (documento)' : ''}. Queda guardado para adjuntarlo a la reserva.${texto ? ` Mensaje: ${texto}` : ''}` });
    } else if (msg.type === 'text') {
      contenido.push({ type: 'text', text: texto });
    } else {
      await sendText(telefono, 'Por ahora solo entiendo mensajes de texto y fotos o PDF de comprobantes. 🙏');
      return;
    }

    // La conversación debe empezar con un mensaje de la administradora
    if (sesion.historial.length && sesion.historial[0].role !== 'user') sesion.historial = [];
    sesion.historial.push({ role: 'user', content: contenido });

    const respuesta = await preguntarAClaude(sesion);
    await sendText(telefono, respuesta);
  } catch (error) {
    console.error('❌ Error en el bot de WhatsApp:', error);
    if (error instanceof Anthropic.APIError) sesion.historial = [];
    await sendText(telefono, '⚠️ Tuve un problema procesando tu mensaje. Intenta de nuevo en un momento.');
  } finally {
    await guardarSesion(sesion).catch(err => console.error('❌ Error guardando sesión del bot:', err));
  }
};
