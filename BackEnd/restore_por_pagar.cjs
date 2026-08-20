require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function restore() {
  console.log('1. Restableciendo saldos restantes (por_pagar) en la tabla reservas...');

  // Reserva 1: Subtotal 140.000, por_pagar = 70.000
  await pool.query("UPDATE reservas SET por_pagar = 70000, estado_saldo = 'Pendiente' WHERE reserva_id = 1");
  await pool.query("UPDATE facturas SET total_restante = 70000 WHERE factura_id = 1");

  // Reserva 2: Subtotal 170.000, por_pagar = 85.000
  await pool.query("UPDATE reservas SET por_pagar = 85000, estado_saldo = 'Pendiente' WHERE reserva_id = 2");
  await pool.query("UPDATE facturas SET total_restante = 85000 WHERE factura_id = 2");

  console.log('✅ Reserva 1 por_pagar = $70.000');
  console.log('✅ Reserva 2 por_pagar = $85.000');

  const checkReservas = await pool.query("SELECT reserva_id, por_pagar FROM reservas");
  console.log('SALDOS RESTANTES EN TABLA RESERVAS:', checkReservas.rows);

  pool.end();
}

restore().catch(console.error);
