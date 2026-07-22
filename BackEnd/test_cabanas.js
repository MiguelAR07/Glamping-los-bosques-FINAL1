import pool from './src/config/db.js';

async function test() {
  try {
    const r = await pool.query("UPDATE cabanas SET estado = 'Activo' WHERE cabana_id = 1");
    console.log("Cabaña Palmas activada!");
  } catch(e) { console.error(e); } finally { process.exit(0); }
}
test();
