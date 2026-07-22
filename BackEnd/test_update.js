import pool from './src/config/db.js';

async function test() {
  try {
    const r = await pool.query(`
      UPDATE paquetes SET
        dias_estadia = COALESCE(NULLIF($1::text, '')::integer, dias_estadia),
        precio_promocional = COALESCE(NULLIF($2::text, '')::numeric, precio_promocional)
      WHERE paquete_id = 21
      RETURNING *
    `, [0, 0]);
    console.table(r.rows);
  } catch(e) { console.error(e); } finally { process.exit(0); }
}
test();
