require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function updateTestReservations() {
  console.log('Inspeccionando reservas...');
  const res = await pool.query(`
    SELECT r.reserva_id, r.por_pagar, f.factura_id, f.subtotal, f.total 
    FROM reservas r 
    JOIN facturas f ON r.reserva_id = f.reserva_id
  `);
  console.log('Reservas y Facturas:', res.rows);

  // Si reserva 1 (subtotal 140,000) tiene por_pagar 140,000 y se pagó el 50% (70,000):
  // Actualizamos reserva 1 a por_pagar = 70,000 y agregamos el pago de 70,000
  const checkPago1 = await pool.query("SELECT 1 FROM pagos WHERE factura_id = 1");
  if (checkPago1.rows.length === 0) {
    await pool.query("UPDATE reservas SET por_pagar = 70000 WHERE reserva_id = 1");
    await pool.query("UPDATE facturas SET total_restante = 70000 WHERE factura_id = 1");
    await pool.query("INSERT INTO pagos (factura_id, fecha_pago, metodo_id, estado, total_pagado) VALUES (1, CURRENT_DATE, 1, 'Agregado Manual', 70000)");
    console.log('✅ Creado pago de $70,000 para reserva 1');
  }

  // Si reserva 2 (subtotal 170,000) tiene por_pagar 160,000 (solo 10k), si pagó el 50% (85,000):
  // Actualizamos por_pagar = 85,000 y pago = 85,000
  await pool.query("UPDATE reservas SET por_pagar = 85000 WHERE reserva_id = 2");
  await pool.query("UPDATE facturas SET total_restante = 85000 WHERE factura_id = 2");
  await pool.query("UPDATE pagos SET total_pagado = 85000 WHERE factura_id = 2");
  console.log('✅ Actualizado pago a $85,000 para reserva 2');

  const newStats = await pool.query("SELECT SUM(total_pagado) FROM pagos");
  console.log('NUEVO TOTAL INGRESOS DEL MES:', newStats.rows[0]);

  pool.end();
}

updateTestReservations().catch(console.error);
