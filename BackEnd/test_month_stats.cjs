require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  const byMonth = await pool.query(`
    SELECT 
      TO_CHAR(pg.fecha_pago, 'MM') AS mes_num,
      TO_CHAR(pg.fecha_pago, 'YYYY-MM') AS mes_yyyymm,
      COALESCE(SUM(pg.total_pagado), 0) AS total
    FROM pagos pg
    JOIN facturas f ON pg.factura_id = f.factura_id
    JOIN reservas r ON f.reserva_id = r.reserva_id
    WHERE r.estado NOT IN ('Cancelado', 'Cancelada')
      AND pg.estado NOT IN ('Cancelado', 'Rechazado')
    GROUP BY TO_CHAR(pg.fecha_pago, 'MM'), TO_CHAR(pg.fecha_pago, 'YYYY-MM')
    ORDER BY mes_num ASC;
  `);

  console.log("REVENUE BY MONTH:");
  console.table(byMonth.rows);

  const byMonthAndCabin = await pool.query(`
    SELECT 
      TO_CHAR(pg.fecha_pago, 'MM') AS mes_num,
      TO_CHAR(pg.fecha_pago, 'YYYY-MM') AS mes_yyyymm,
      c.cabana_id,
      c.nombre AS cabana_nombre,
      COALESCE(SUM(pg.total_pagado), 0) AS total
    FROM pagos pg
    JOIN facturas f ON pg.factura_id = f.factura_id
    JOIN reservas r ON f.reserva_id = r.reserva_id
    LEFT JOIN paquetes p ON r.paquete_id = p.paquete_id
    LEFT JOIN cabanas c ON p.cabana_id = c.cabana_id
    WHERE r.estado NOT IN ('Cancelado', 'Cancelada')
      AND pg.estado NOT IN ('Cancelado', 'Rechazado')
    GROUP BY TO_CHAR(pg.fecha_pago, 'MM'), TO_CHAR(pg.fecha_pago, 'YYYY-MM'), c.cabana_id, c.nombre
    ORDER BY mes_num ASC;
  `);

  console.log("REVENUE BY MONTH AND CABIN:");
  console.table(byMonthAndCabin.rows);

  pool.end();
}

main().catch(console.error);
