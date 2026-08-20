require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkStats() {
  console.log('--- REVISANDO VALORES DEVUELTOS POR EL BACKEND ---');

  const monthRevenue = await pool.query(`
    SELECT COALESCE(SUM(pg.total_pagado), 0) AS total
    FROM pagos pg
    JOIN facturas f ON pg.factura_id = f.factura_id
    JOIN reservas r ON f.reserva_id = r.reserva_id
    WHERE r.estado NOT IN ('Cancelado', 'Cancelada')
      AND pg.estado NOT IN ('Cancelado', 'Rechazado')
      AND pg.fecha_pago >= DATE_TRUNC('month', CURRENT_DATE)
  `);
  console.log('💰 REVENUE MONTH (SUMA DE ABONOS EN PAGOS):', monthRevenue.rows[0].total);

  const graphData = await pool.query(`
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
    ORDER BY fecha ASC;
  `);
  console.log('📊 GRAFICA POR MES (PAGOS):', graphData.rows);

  const cabinRevenue = await pool.query(`
    SELECT 
      c.cabana_id,
      c.nombre AS cabana_nombre,
      COALESCE(SUM(pg.total_pagado), 0) AS total
    FROM cabanas c
    LEFT JOIN paquetes p ON c.cabana_id = p.cabana_id
    LEFT JOIN reservas r ON p.paquete_id = r.paquete_id AND r.estado NOT IN ('Cancelado', 'Cancelada')
    LEFT JOIN facturas f ON r.reserva_id = f.reserva_id
    LEFT JOIN pagos pg ON f.factura_id = pg.factura_id 
      AND pg.estado NOT IN ('Cancelado', 'Rechazado') 
      AND pg.fecha_pago >= DATE_TRUNC('month', CURRENT_DATE)
    GROUP BY c.cabana_id, c.nombre
    ORDER BY c.nombre ASC
  `);
  console.log('🏠 INGRESOS POR CABAÑA (ABONOS):', cabinRevenue.rows);

  pool.end();
}

checkStats().catch(console.error);
