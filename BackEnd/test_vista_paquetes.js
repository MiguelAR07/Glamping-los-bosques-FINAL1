import pool from './src/config/db.js';

async function test() {
  try {
    const res = await pool.query('SELECT * FROM vista_paquetes LIMIT 1;');
    console.log(res.rows);
  } catch(e) { console.error(e); } finally { process.exit(0); }
}
test();
