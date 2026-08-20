require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function setFull310k() {
  console.log('Estableciendo facturas 1 y 2 al 100% pagadas ($140.000 + $170.000 = $310.000)...');

  // Reserva 1: Subtotal 140.000, 100% abonado ($140.000), por_pagar = 0
  await pool.query("UPDATE reservas SET por_pagar = 0, estado = 'Confirmada', estado_saldo = 'Aprobado' WHERE reserva_id = 1");
  await pool.query("UPDATE facturas SET total_restante = 0 WHERE factura_id = 1");
  await pool.query("UPDATE pagos SET total_pagado = 140000 WHERE factura_id = 1");

  // Reserva 2: Subtotal 170.000, 100% abonado ($170.000), por_pagar = 0
  await pool.query("UPDATE reservas SET por_pagar = 0, estado = 'Confirmada', estado_saldo = 'Aprobado' WHERE reserva_id = 2");
  await pool.query("UPDATE facturas SET total_restante = 0 WHERE factura_id = 2");
  await pool.query("UPDATE pagos SET total_pagado = 170000 WHERE factura_id = 2");

  console.log('✅ Reserva 1: 100% abonado ($140.000), por_pagar = $0');
  console.log('✅ Reserva 2: 100% abonado ($170.000), por_pagar = $0');

  const checkPagos = await pool.query("SELECT SUM(total_pagado) FROM pagos");
  console.log('🎯 NUEVO TOTAL INGRESOS DEL MES EN PAGOS:', checkPagos.rows[0].sum);

  const checkGraph = await pool.query(`
    SELECT 
      TO_CHAR(pg.fecha_pago, 'YYYY-MM') AS fecha,
      SUM(pg.total_pagado) AS total
    FROM pagos pg
    JOIN facturas f ON pg.factura_id = f.factura_id
    JOIN reservas r ON f.reserva_id = r.reserva_id
    WHERE r.estado NOT IN ('Cancelado', 'Cancelada')
      AND pg.estado NOT IN ('Cancelado', 'Rechazado')
      AND pg.fecha_pago >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '5 months'
    GROUP BY TO_CHAR(pg.fecha_pago, 'YYYY-MM')
    ORDER BY fecha ASC
  `);
  console.log('📊 GRAFICA DE INGRESOS:', checkGraph.rows);

  pool.end();
}

setFull310k().catch(console.error);
