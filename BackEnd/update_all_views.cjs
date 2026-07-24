const { Pool } = require('pg');
require('dotenv').config();

const queries = [
  'DROP VIEW IF EXISTS vista_reservas CASCADE;',
  `CREATE OR REPLACE VIEW vista_reservas AS
   SELECT r.reserva_id AS id,
     tp.nombre || ' - ' || p.nombre AS paquete,
     cb.nombre AS cabana,
     c.nombre AS cliente,
     c.contacto AS "Celular",
     c.numero_identificacion AS "Cédula",
     r.fecha_registro AS fecha,
     r.llegada,
     r.salida,
     r.estado,
     r.por_pagar AS "Pago restante",
     r.factura_url AS comprobante_url,
     r.adultos,
     r.ninos,
     r.mascotas,
     r.comprobante_saldo_url,
     r.estado_saldo,
     r.reserva_id
   FROM reservas r
     JOIN clientes c ON c.cliente_id = r.cliente_id
     JOIN paquetes p ON p.paquete_id = r.paquete_id
     JOIN tipo_paquete tp ON tp.tipo_id = p.tipo_id
     JOIN cabanas cb ON cb.cabana_id = p.cabana_id;`
];

async function updateDb(connectionString, name) {
  const pool = new Pool({
    connectionString,
    ssl: connectionString.includes('localhost') || connectionString.includes('127.0.0.1') ? false : { rejectUnauthorized: false }
  });

  try {
    for (const q of queries) {
      await pool.query(q);
    }
    console.log(`[OK] ${name} vista_reservas actualizada.`);
  } catch (err) {
    console.error(`[Error] ${name}:`, err.message);
  } finally {
    await pool.end();
  }
}

async function main() {
  if (process.env.DATABASE_URL) {
    await updateDb(process.env.DATABASE_URL, 'Supabase DB');
  }
  const localUrl = 'postgresql://postgres:miguel2006@localhost:5432/glamping';
  await updateDb(localUrl, 'Local Postgres');
}

main();
