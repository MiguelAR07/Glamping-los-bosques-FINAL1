require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function updateView() {
  console.log('Actualizando vista_reservas con subtotal, total abonado y pago restante...');

  await pool.query('DROP VIEW IF EXISTS vista_reservas CASCADE;');

  await pool.query(`
    CREATE VIEW vista_reservas AS
    SELECT 
        r.reserva_id AS id,
        r.reserva_id,
        r.paquete_id,
        r.cliente_id,
        p.cabana_id,
        p.tipo_id,
        f.factura_id,
        (tp.nombre::text || ' - '::text) || p.nombre::text AS paquete,
        cb.nombre AS cabana,
        c.nombre AS cliente,
        c.contacto AS "Celular",
        c.numero_identificacion AS "Cédula",
        r.fecha_registro AS fecha,
        r.llegada,
        r.salida,
        r.estado,
        COALESCE(f.subtotal, 0) AS subtotal,
        COALESCE(f.subtotal * (1 - COALESCE(f.descuento, 0) / 100.0) - r.por_pagar, 0) AS "Total abonado",
        r.por_pagar AS "Pago restante",
        r.factura_url AS comprobante_url,
        COALESCE(( SELECT string_agg(((s.servicio::text || ' ('::text) || sp.cantidad_personas) || ' pax)'::text, ', '::text) AS string_agg
               FROM servicios_por_paquete sp
                 JOIN vista_servicios s ON sp.servicio_id = s.id
              WHERE sp.paquete_id = p.paquete_id), 'Ninguno'::text) AS "Servicios adicionales",
        r.adultos,
        r.ninos,
        r.mascotas,
        r.comprobante_saldo_url,
        r.estado_saldo
       FROM reservas r
         JOIN clientes c ON c.cliente_id = r.cliente_id
         JOIN paquetes p ON p.paquete_id = r.paquete_id
         JOIN tipo_paquete tp ON tp.tipo_id = p.tipo_id
         JOIN cabanas cb ON cb.cabana_id = p.cabana_id
         LEFT JOIN facturas f ON f.reserva_id = r.reserva_id;
  `);

  console.log('✅ vista_reservas actualizada correctamente con subtotal, total abonado y pago restante.');

  const check = await pool.query("SELECT id, cliente, subtotal, \"Total abonado\", \"Pago restante\" FROM vista_reservas ORDER BY id ASC");
  console.log('RESULTADO EN BASE DE DATOS:', check.rows);

  pool.end();
}

updateView().catch(console.error);
