require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function fixData() {
  console.log('1. Eliminando servicios asignados a la Reserva 1 (paquete 113)...');
  await pool.query("DELETE FROM servicios_por_paquete WHERE paquete_id = 113");
  console.log('✅ Servicios de la Reserva 1 eliminados.');

  console.log('2. Actualizando montos pagados para Reserva 1 ($140.000) y Reserva 2 ($170.000)...');
  
  // Reserva 1: $140.000 pagados, por_pagar = 0
  await pool.query("UPDATE reservas SET por_pagar = 0, estado = 'Confirmada' WHERE reserva_id = 1");
  await pool.query("UPDATE facturas SET total_restante = 0 WHERE factura_id = 1");
  await pool.query("DELETE FROM pagos WHERE factura_id = 1");
  await pool.query("INSERT INTO pagos (factura_id, fecha_pago, metodo_id, estado, total_pagado) VALUES (1, CURRENT_DATE, 1, 'Agregado Manual', 140000)");

  // Reserva 2: $170.000 pagados, por_pagar = 0
  await pool.query("UPDATE reservas SET por_pagar = 0, estado = 'Confirmada' WHERE reserva_id = 2");
  await pool.query("UPDATE facturas SET total_restante = 0 WHERE factura_id = 2");
  await pool.query("DELETE FROM pagos WHERE factura_id = 2");
  await pool.query("INSERT INTO pagos (factura_id, fecha_pago, metodo_id, estado, total_pagado) VALUES (2, CURRENT_DATE, 1, 'Agregado Manual', 170000)");

  console.log('✅ Reserva 1 y Reserva 2 actualizadas a pago completo ($140.000 y $170.000).');

  const checkPagos = await pool.query("SELECT SUM(total_pagado) FROM pagos");
  console.log('🎯 NUEVO TOTAL DE INGRESOS EN PAGOS:', checkPagos.rows[0].sum);

  pool.end();
}

fixData().catch(console.error);
