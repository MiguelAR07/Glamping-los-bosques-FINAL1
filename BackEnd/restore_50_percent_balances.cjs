require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function restore50() {
  console.log('Restableciendo anticipo (50%) y saldo restante (50%) para Reserva 1 y Reserva 2...');

  // Reserva 1: Total 140.000 => Abonado 70.000, Restante 70.000
  await pool.query("UPDATE reservas SET por_pagar = 70000, estado_saldo = 'Pendiente' WHERE reserva_id = 1");
  await pool.query("UPDATE facturas SET total_restante = 70000 WHERE factura_id = 1");
  await pool.query("UPDATE pagos SET total_pagado = 70000 WHERE factura_id = 1");

  // Reserva 2: Total 170.000 => Abonado 85.000, Restante 85.000
  await pool.query("UPDATE reservas SET por_pagar = 85000, estado_saldo = 'Pendiente' WHERE reserva_id = 2");
  await pool.query("UPDATE facturas SET total_restante = 85000 WHERE factura_id = 2");
  await pool.query("UPDATE pagos SET total_pagado = 85000 WHERE factura_id = 2");

  console.log('✅ Reserva 1 y Reserva 2 ajustadas al 50% de anticipo y 50% por pagar.');

  const check = await pool.query(`
    SELECT id, cliente, subtotal AS "Precio Total", "Total abonado", "Pago restante" AS "Total Restante" 
    FROM vista_reservas 
    ORDER BY id ASC
  `);
  console.log('ESTADO FINAL CON 50% DE ANTICIPO Y 50% RESTANTE:', check.rows);

  pool.end();
}

restore50().catch(console.error);
