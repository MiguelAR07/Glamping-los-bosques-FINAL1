require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function updatePalmas() {
  console.log('Actualizando finanzas de Reserva #2 (Cabaña Palmas): Total $350.000, Abonado $170.000, Restante $180.000...');

  // Reserva 2 (Cabaña Palmas): Subtotal 350.000, Abonado 170.000 => por_pagar = 180.000
  await pool.query("UPDATE reservas SET por_pagar = 180000 WHERE reserva_id = 2");
  await pool.query("UPDATE facturas SET subtotal = 350000, total_restante = 180000 WHERE factura_id = 2");
  await pool.query("UPDATE pagos SET total_pagado = 170000 WHERE factura_id = 2");

  console.log('✅ Reserva #2 (Cabaña Palmas) actualizada.');

  const check = await pool.query(`
    SELECT id, cliente, cabana, subtotal AS "Precio Total", "Total abonado", "Pago restante" AS "Total Restante" 
    FROM vista_reservas 
    ORDER BY id ASC
  `);
  console.log('ESTADO FINAL DE LA TABLA GENERAL DE RESERVAS:', check.rows);

  pool.end();
}

updatePalmas().catch(console.error);
