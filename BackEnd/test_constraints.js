import pool from './src/config/db.js';

async function test() {
  try {
    const res = await pool.query(`
      SELECT conname, pg_get_constraintdef(c.oid)
      FROM pg_constraint c
      JOIN pg_namespace n ON n.oid = c.connamespace
      WHERE conrelid = 'clientes'::regclass;
    `);
    console.table(res.rows);
  } catch(e) { console.error(e); } finally { process.exit(0); }
}
test();
