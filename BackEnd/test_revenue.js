import pool from './src/config/db.js';

async function test() {
  try {
    const r = await pool.query(`
      SELECT 
        c.cabana_id,
        c.nombre AS cabana_nombre,
        COALESCE(SUM(pg.total_pagado), 0) AS total
      FROM cabanas c
      LEFT JOIN paquetes p ON c.cabana_id = p.cabana_id
      LEFT JOIN reservas r ON p.paquete_id = r.paquete_id AND r.estado <> 'Cancelada'
      LEFT JOIN facturas f ON r.reserva_id = f.reserva_id
      LEFT JOIN pagos pg ON f.factura_id = pg.factura_id 
        AND pg.estado IN ('Completado', 'Agregado Manual') 
        AND pg.fecha_pago >= DATE_TRUNC('month', CURRENT_DATE)
      GROUP BY c.cabana_id, c.nombre
      ORDER BY c.nombre ASC
    `);
    console.log(r.rows);
  } catch(e) { console.error(e); } finally { process.exit(0); }
}
test();
