// Crea en Meta las plantillas de WhatsApp que usa el sistema y muestra su estado.
// Uso (desde la carpeta BackEnd):
//   node --env-file=.env scripts/whatsapp_templates.mjs          -> crea las que falten y lista el estado
//   node --env-file=.env scripts/whatsapp_templates.mjs --estado -> solo lista el estado
// Requiere WHATSAPP_TOKEN y WHATSAPP_WABA_ID (identificador de la cuenta de WhatsApp Business).

import { TEMPLATES } from '../src/services/whatsapp.service.js';

const token = process.env.WHATSAPP_TOKEN;
const waba = process.env.WHATSAPP_WABA_ID;
const lang = process.env.WHATSAPP_LANG || 'es';
const soloEstado = process.argv.includes('--estado');

if (!token || !waba) {
  console.error('Faltan WHATSAPP_TOKEN o WHATSAPP_WABA_ID en el .env');
  process.exit(1);
}

const api = async (path, options = {}) => {
  const res = await fetch(`https://graph.facebook.com/v21.0/${path}`, {
    ...options,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
  });
  return [res.ok, await res.json()];
};

const [ok, existentes] = await api(`${waba}/message_templates?fields=name,status,language,rejected_reason&limit=200`);
if (!ok) {
  console.error('No se pudieron leer las plantillas:', JSON.stringify(existentes.error || existentes));
  process.exit(1);
}
const yaExiste = new Set(existentes.data.filter(t => t.language === lang).map(t => t.name));

if (!soloEstado) {
  for (const [name, { body, example }] of Object.entries(TEMPLATES)) {
    if (yaExiste.has(name)) continue;
    const [creado, data] = await api(`${waba}/message_templates`, {
      method: 'POST',
      body: JSON.stringify({
        name,
        language: lang,
        category: 'UTILITY',
        components: [{ type: 'BODY', text: body, example: { body_text: [example] } }]
      })
    });
    console.log(creado ? `🆕 ${name}: enviada a revisión (${data.status})` : `❌ ${name}: ${data.error?.error_user_msg || data.error?.message}`);
  }
}

const [, final] = await api(`${waba}/message_templates?fields=name,status,language,rejected_reason&limit=200`);
console.log('\nEstado de las plantillas:');
for (const name of Object.keys(TEMPLATES)) {
  const t = final.data?.find(x => x.name === name && x.language === lang);
  console.log(`  ${t ? (t.status === 'APPROVED' ? '✅' : t.status === 'REJECTED' ? '❌' : '⏳') : '—'} ${name}: ${t ? t.status : 'no existe'}${t?.rejected_reason && t.rejected_reason !== 'NONE' ? ` (${t.rejected_reason})` : ''}`);
}
