const { Pool } = require('pg');

async function checkLatestLocal() {
  const localUrl = 'postgresql://postgres:miguel2006@localhost:5432/glamping';
  const pool = new Pool({
    connectionString: localUrl,
    ssl: false
  });

  try {
    const res = await pool.query(`
      SELECT r.reserva_id, f.factura_id, f.subtotal, f.descuento, r.por_pagar, pg.total_pagado 
      FROM reservas r 
      JOIN facturas f ON r.reserva_id = f.reserva_id 
      LEFT JOIN pagos pg ON f.factura_id = pg.factura_id 
      ORDER BY r.reserva_id DESC 
      LIMIT 5
    `);
    console.log(`[Local Postgres] Latest 5:`, res.rows);
  } catch (err) {
    console.error(`[Error] Local Postgres:`, err.message);
  } finally {
    await pool.end();
  }
}

checkLatestLocal();
