require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function fix1and2() {
  console.log('Ajustando Reserva 1 (140.000 abonados, 0 restante) y Reserva 2 (170.000 abonados, 0 restante)...');

  // Reserva 1: Subtotal 140.000, Total Abonado 140.000, por_pagar = 0
  await pool.query("UPDATE reservas SET por_pagar = 0, estado = 'Confirmada', estado_saldo = 'Aprobado' WHERE reserva_id = 1");
  await pool.query("UPDATE facturas SET total_restante = 0 WHERE factura_id = 1");
  await pool.query("UPDATE pagos SET total_pagado = 140000 WHERE factura_id = 1");

  // Reserva 2: Subtotal 170.000, Total Abonado 170.000, por_pagar = 0
  await pool.query("UPDATE reservas SET por_pagar = 0, estado = 'Confirmada', estado_saldo = 'Aprobado' WHERE reserva_id = 2");
  await pool.query("UPDATE facturas SET total_restante = 0 WHERE factura_id = 2");
  await pool.query("UPDATE pagos SET total_pagado = 170000 WHERE factura_id = 2");

  console.log('✅ Reserva 1 y Reserva 2 actualizadas a abono completo.');

  const check = await pool.query(`
    SELECT id, cliente, subtotal AS "Precio Total", "Total abonado", "Pago restante" AS "Total Restante" 
    FROM vista_reservas 
    ORDER BY id ASC
  `);
  console.log('ESTADO DE LA TABLA GENERAL DE RESERVAS:', check.rows);

  pool.end();
}

fix1and2().catch(console.error);
