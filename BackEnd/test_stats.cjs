require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkStats() {
  const m = await pool.query(`
    SELECT COALESCE(SUM(pg.total_pagado), 0) AS total
    FROM pagos pg
    JOIN facturas f ON pg.factura_id = f.factura_id
    JOIN reservas r ON f.reserva_id = r.reserva_id
    WHERE r.estado NOT IN ('Cancelado', 'Cancelada')
      AND pg.estado NOT IN ('Cancelado', 'Rechazado')
      AND pg.fecha_pago >= DATE_TRUNC('month', CURRENT_DATE)
  `);

  const totalFromReservas = await pool.query(`
    SELECT COALESCE(SUM((f.subtotal - f.descuento) - r.por_pagar), 0) AS total_calculado
    FROM reservas r
    JOIN facturas f ON r.reserva_id = f.reserva_id
    WHERE r.estado NOT IN ('Cancelado', 'Cancelada')
  `);

  const graphData = await pool.query(`
    SELECT 
      TO_CHAR(pg.fecha_pago, 'YYYY-MM') AS fecha,
      SUM(pg.total_pagado) AS total
    FROM pagos pg
    JOIN facturas f ON pg.factura_id = f.factura_id
    JOIN reservas r ON f.reserva_id = r.reserva_id
    WHERE r.estado NOT IN ('Cancelado', 'Cancelada')
      AND pg.estado NOT IN ('Cancelado', 'Rechazado')
      AND pg.fecha_pago >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '5 months'
    GROUP BY TO_CHAR(pg.fecha_pago, 'YYYY-MM')
    ORDER BY fecha ASC
  `);

  console.log('REVENUE FROM PAGOS TABLE:', m.rows[0]);
  console.log('REVENUE FROM RESERVAS CALCULATED:', totalFromReservas.rows[0]);
  console.log('GRAPH DATA:', graphData.rows);

  pool.end();
}

checkStats().catch(console.error);
