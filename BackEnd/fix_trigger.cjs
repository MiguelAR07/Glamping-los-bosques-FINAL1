const { Pool } = require('pg');
require('dotenv').config();

async function fixData(connectionString, name) {
  const pool = new Pool({
    connectionString,
    ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false }
  });

  try {
    await pool.query(`UPDATE facturas SET subtotal = 350000 WHERE reserva_id = 1`);
    await pool.query(`UPDATE pagos SET total_pagado = 175000 WHERE factura_id = 1`);
    console.log(`[OK] ${name}: reserva 1 actualizada (subtotal=350000, total_pagado=175000).`);
  } catch (err) {
    console.error(`[Error] ${name}:`, err.message);
  } finally {
    await pool.end();
  }
}

async function main() {
  if (process.env.DATABASE_URL) {
    await fixData(process.env.DATABASE_URL, 'Supabase DB');
  }
}
main();
