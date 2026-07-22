import pool from './src/config/db.js';

async function test() {
  try {
    const res = await pool.query('SELECT r.*, c.email, c.nombre FROM reservas r JOIN clientes c ON r.cliente_id = c.cliente_id LIMIT 1;');
    console.log("Check if we can query email directly.");
  } catch(e) { console.error(e); } finally { process.exit(0); }
}
test();
