require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function fixReserva3() {
  console.log('Corrigiendo valores de Reserva 3 (450.000 subtotal, 225.000 por pagar, 225.000 pagado)...');

  await pool.query("UPDATE reservas SET por_pagar = 225000 WHERE reserva_id = 3");
  await pool.query("UPDATE facturas SET subtotal = 450000, total_restante = 225000 WHERE reserva_id = 3");
  await pool.query("UPDATE pagos SET total_pagado = 225000 WHERE factura_id = 3");

  console.log('✅ Reserva 3 corregida a $450.000 subtotal, $225.000 por pagar y $225.000 pagado.');

  const res = await pool.query(`
    SELECT r.reserva_id, r.por_pagar, f.subtotal, f.total, p.total_pagado 
    FROM reservas r 
    JOIN facturas f ON r.reserva_id = f.reserva_id
    LEFT JOIN pagos p ON f.factura_id = p.factura_id
    ORDER BY r.reserva_id ASC
  `);
  console.log('ESTADO COMPLETO DE RESERVAS Y FACTURAS:', res.rows);

  const totalRevenue = await pool.query("SELECT COALESCE(SUM(f.total), 0) FROM facturas f JOIN reservas r ON f.reserva_id = r.reserva_id WHERE r.estado NOT IN ('Cancelado', 'Cancelada')");
  console.log('🎯 TOTAL DE INGRESOS EN PANEL (SUMA DE FACTURAS):', totalRevenue.rows[0].sum);

  pool.end();
}

fixReserva3().catch(console.error);
