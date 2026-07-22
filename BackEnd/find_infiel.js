import pool from './src/config/db.js';

async function test() {
  try {
    const r = await pool.query("SELECT cabana_id, nombre FROM cabanas WHERE nombre ILIKE '%infiel%'");
    console.table(r.rows);
  } catch(e) { console.error(e); } finally { process.exit(0); }
}
test();
