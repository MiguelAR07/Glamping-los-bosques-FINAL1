require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function updateViews() {
  const client = await pool.connect();
  try {
    console.log("Actualizando vista_pagos_stats en Supabase...");
    await client.query(`
      CREATE OR REPLACE VIEW vista_pagos_stats AS
      SELECT 
          COALESCE(SUM(CASE WHEN tipo = 'pago' THEN monto ELSE 0 END), 0) AS total_cobrado,
          COALESCE(SUM(CASE WHEN tipo = 'reembolso' THEN monto ELSE 0 END), 0) AS total_reembolsado,
          COALESCE(SUM(CASE WHEN tipo = 'pago' THEN monto ELSE -monto END), 0) AS saldo_neto_mes
      FROM (
          SELECT fecha_pago AS fecha, total_pagado AS monto, 'pago' AS tipo 
          FROM pagos 
          WHERE estado NOT IN ('Cancelado', 'Rechazado')
          UNION ALL
          SELECT fecha, monto, 'reembolso' AS tipo 
          FROM reembolsos
      ) AS reporte;
    `);
    console.log("vista_pagos_stats actualizada con éxito.");
  } catch (error) {
    console.error("Error al actualizar la vista:", error);
  } finally {
    client.release();
    pool.end();
  }
}

updateViews();
