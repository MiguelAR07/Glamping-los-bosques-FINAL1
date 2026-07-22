import pool from './src/config/db.js';

async function test() {
  try {
    const res = await pool.query('SELECT * FROM notificaciones ORDER BY notificacion_id DESC LIMIT 2;');
    console.log(res.rows);
  } catch(e) { console.error(e); } finally { process.exit(0); }
}
test();
