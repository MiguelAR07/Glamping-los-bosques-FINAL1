import pool from './src/config/db.js';

async function test() {
  try {
    const res = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'notificaciones';
    `);
    console.log(res.rows);
  } catch(e) { console.error(e); } finally { process.exit(0); }
}
test();
