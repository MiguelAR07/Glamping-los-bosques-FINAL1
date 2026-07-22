import pool from './src/config/db.js';

async function test() {
  const id = 4;
  try {
    const res = await pool.query("DELETE FROM cabanas WHERE cabana_id = $1", [id]);
    console.log("Cabaña eliminada totalmente, filas afectadas:", res.rowCount);
  } catch(e) { console.error(e); } finally { process.exit(0); }
}
test();
