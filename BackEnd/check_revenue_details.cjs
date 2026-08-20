require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  console.log("=== RESERVAS ===");
  const reservas = await pool.query(`
    SELECT r.reserva_id, r.estado, r.por_pagar, r.fecha_registro, r.llegada, r.salida, f.factura_id, f.subtotal, f.descuento, f.total
    FROM reservas r
    LEFT JOIN facturas f ON r.reserva_id = f.reserva_id
  `);
  console.table(reservas.rows);

  console.log("=== PAGOS ===");
  const pagos = await pool.query(`SELECT * FROM pagos`);
  console.table(pagos.rows);

  console.log("=== DASHBOARD STATS CURRENT ===");
  const dashStats = await pool.query(`
    SELECT 
      (SELECT COUNT(*) FROM reservas WHERE estado IN ('Completado', 'Pagado') AND fecha_registro >= DATE_TRUNC('month', CURRENT_DATE)) AS total_reservations,
      (SELECT saldo_neto_mes FROM vista_pagos_stats) AS revenue_vista_pagos_stats
  `);
  console.table(dashStats.rows);

  console.log("=== PAYMENT STATS REVENUE CURRENT ===");
  const payRev = await pool.query(`
    SELECT COALESCE(SUM(total_pagado), 0)::FLOAT AS revenue_pagos_curr_month
    FROM pagos
    WHERE estado NOT IN ('Cancelado', 'Rechazado')
      AND fecha_pago >= DATE_TRUNC('month', CURRENT_DATE)
  `);
  console.table(payRev.rows);

  console.log("=== ALL TIME PAYMENTS SUM ===");
  const allPay = await pool.query(`
    SELECT COALESCE(SUM(total_pagado), 0)::FLOAT AS revenue_all_time_pagos
    FROM pagos
    WHERE estado NOT IN ('Cancelado', 'Rechazado')
  `);
  console.table(allPay.rows);

  console.log("=== ACTIVE RESERVATIONS CALCULATED PAID AMOUNT ===");
  const activePaid = await pool.query(`
    SELECT 
      SUM(f.total - r.por_pagar) AS total_abonado_calc,
      SUM(f.total) AS total_facturado
    FROM reservas r
    JOIN facturas f ON r.reserva_id = f.reserva_id
    WHERE r.estado NOT IN ('Cancelado', 'Cancelada')
  `);
  console.table(activePaid.rows);

  pool.end();
}

main().catch(console.error);
