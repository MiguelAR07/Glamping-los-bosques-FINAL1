import { Router } from "express";
import crypto from "crypto";

// Webhook de Meta WhatsApp Cloud API
// Variables de entorno:
// WHATSAPP_VERIFY_TOKEN -> mismo valor que se escribe en "Token de verificación" en Meta
// WHATSAPP_APP_SECRET   -> "Clave secreta de la app" (Configuración de la app > Básica), valida la firma de Meta

const router = Router();

// Meta llama a este GET una sola vez al guardar el webhook
router.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  res.sendStatus(403);
});

const firmaValida = (req) => {
  const secret = process.env.WHATSAPP_APP_SECRET;
  if (!secret) return true;
  const firma = req.get('x-hub-signature-256') || '';
  const esperada = 'sha256=' + crypto.createHmac('sha256', secret).update(req.rawBody || '').digest('hex');
  return firma.length === esperada.length && crypto.timingSafeEqual(Buffer.from(firma), Buffer.from(esperada));
};

// Meta envía aquí los mensajes entrantes y los estados de entrega
router.post('/webhook', (req, res) => {
  if (!firmaValida(req)) return res.sendStatus(401);

  // Meta exige respuesta rápida; el procesamiento va después
  res.sendStatus(200);

  try {
    const value = req.body?.entry?.[0]?.changes?.[0]?.value;
    for (const msg of value?.messages || []) {
      console.log(`📩 WhatsApp entrante de ${msg.from} (${msg.type}):`, msg.text?.body || '');
    }
    for (const st of value?.statuses || []) {
      console.log(`📬 Estado WhatsApp ${st.status} para ${st.recipient_id}`, st.errors ? JSON.stringify(st.errors) : '');
    }
  } catch (error) {
    console.error('❌ Error procesando webhook de WhatsApp:', error);
  }
});

export default router;
