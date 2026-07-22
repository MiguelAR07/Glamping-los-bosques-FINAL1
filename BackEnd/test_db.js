import pool from './src/config/db.js';

async function test() {
  try {
    const r = await pool.query(`
      SELECT p.paquete_id, p.nombre, p.estado, p.tipo_id, c.nombre as cabana 
      FROM paquetes p 
      JOIN cabanas c ON p.cabana_id = c.cabana_id 
      WHERE c.nombre ILIKE '%roble%'
    `);
    console.table(r.rows);
  } catch(e) { console.error(e); } finally { process.exit(0); }
}
test();
