require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function applyExactFinancials() {
  console.log('Aplicando valores exactos solicitados por el usuario...');

  // 1. Actualizar vista_reservas para tomar el "Total abonado" directamente de los pagos o de (subtotal - por_pagar)
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
        COALESCE((SELECT SUM(pg.total_pagado) FROM pagos pg WHERE pg.factura_id = f.factura_id AND pg.estado NOT IN ('Cancelado', 'Rechazado')), f.subtotal - r.por_pagar, 0) AS "Total abonado",
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

  // Reserva 1: Total Abonado = 140.000, Total Restante = 70.000 => Subtotal = 210.000
  await pool.query("UPDATE reservas SET por_pagar = 70000 WHERE reserva_id = 1");
  await pool.query("UPDATE facturas SET subtotal = 210000, total_restante = 70000 WHERE factura_id = 1");
  await pool.query("UPDATE pagos SET total_pagado = 140000 WHERE factura_id = 1");

  // Reserva 2: Total Abonado = 170.000, Total Restante = 85.000 => Subtotal = 255.000
  await pool.query("UPDATE reservas SET por_pagar = 85000 WHERE reserva_id = 2");
  await pool.query("UPDATE facturas SET subtotal = 255000, total_restante = 85000 WHERE factura_id = 2");
  await pool.query("UPDATE pagos SET total_pagado = 170000 WHERE factura_id = 2");

  // Reserva 3 (miguel): Total Abonado = 225.000, Total Restante = 225.000 => Subtotal = 450.000
  await pool.query("UPDATE reservas SET por_pagar = 225000 WHERE reserva_id = 3");
  await pool.query("UPDATE facturas SET subtotal = 450000, total_restante = 225000 WHERE factura_id = 3");
  await pool.query("UPDATE pagos SET total_pagado = 225000 WHERE factura_id = 3");

  console.log('✅ Base de datos actualizada con los abonos y restantes exactos.');

  const check = await pool.query(`
    SELECT id, cliente, subtotal AS "Precio Total", "Total abonado", "Pago restante" AS "Total Restante" 
    FROM vista_reservas 
    ORDER BY id ASC
  `);
  console.log('ESTADO FINAL DE LA TABLA:', check.rows);

  pool.end();
}

applyExactFinancials().catch(console.error);
