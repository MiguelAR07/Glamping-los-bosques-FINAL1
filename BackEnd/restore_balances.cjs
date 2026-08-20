require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function restore() {
  console.log('Restableciendo saldos restantes (50% por pagar) para Reserva 1 y Reserva 2...');

  // Reserva 1: Subtotal 140.000 => 50% abono ($70.000), 50% por pagar ($70.000)
  await pool.query("UPDATE reservas SET por_pagar = 70000, estado_saldo = 'Pendiente' WHERE reserva_id = 1");
  await pool.query("UPDATE facturas SET total_restante = 70000 WHERE factura_id = 1");
  await pool.query("UPDATE pagos SET total_pagado = 70000 WHERE factura_id = 1");

  // Reserva 2: Subtotal 170.000 => 50% abono ($85.000), 50% por pagar ($85.000)
  await pool.query("UPDATE reservas SET por_pagar = 85000, estado_saldo = 'Pendiente' WHERE reserva_id = 2");
  await pool.query("UPDATE facturas SET total_restante = 85000 WHERE factura_id = 2");
  await pool.query("UPDATE pagos SET total_pagado = 85000 WHERE factura_id = 2");

  console.log('✅ Reserva 1: por_pagar = $70.000 (abono $70.000)');
  console.log('✅ Reserva 2: por_pagar = $85.000 (abono $85.000)');

  const res = await pool.query(`
    SELECT r.reserva_id, r.por_pagar, f.subtotal, p.total_pagado 
    FROM reservas r 
    JOIN facturas f ON r.reserva_id = f.reserva_id
    JOIN pagos p ON f.factura_id = p.factura_id
  `);
  console.log('ESTADO RESERVAS:', res.rows);

  pool.end();
}

restore().catch(console.error);
