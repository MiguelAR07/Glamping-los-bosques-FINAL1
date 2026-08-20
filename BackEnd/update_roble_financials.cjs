require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function updateRoble() {
  console.log('Actualizando finanzas de Reserva #1 (Cabaña Roble): Total $280.000, Abonado $140.000, Restante $140.000...');

  // Reserva 1 (Cabaña Roble): Subtotal 280.000, Abonado 140.000 => por_pagar = 140.000
  await pool.query("UPDATE reservas SET por_pagar = 140000 WHERE reserva_id = 1");
  await pool.query("UPDATE facturas SET subtotal = 280000, total_restante = 140000 WHERE factura_id = 1");
  await pool.query("UPDATE pagos SET total_pagado = 140000 WHERE factura_id = 1");

  console.log('✅ Reserva #1 (Cabaña Roble) actualizada.');

  const check = await pool.query(`
    SELECT id, cliente, cabana, subtotal AS "Precio Total", "Total abonado", "Pago restante" AS "Total Restante" 
    FROM vista_reservas 
    ORDER BY id ASC
  `);
  console.log('ESTADO DEFINITIVO DE LA TABLA GENERAL DE RESERVAS:', check.rows);

  pool.end();
}

updateRoble().catch(console.error);
