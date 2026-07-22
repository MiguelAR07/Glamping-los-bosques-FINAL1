import pool from './src/config/db.js';

async function test() {
  const id = 4;
  try {
    const resReservas = await pool.query("SELECT COUNT(*) FROM reservas r JOIN paquetes p ON r.paquete_id = p.paquete_id WHERE p.cabana_id = $1", [id]);
    const resPaquetes = await pool.query("SELECT COUNT(*) FROM paquetes WHERE cabana_id = $1", [id]);
    const resPromos = await pool.query("SELECT COUNT(*) FROM promociones_cabanas WHERE cabana_id = $1", [id]);
    const resImgs = await pool.query("SELECT COUNT(*) FROM imagenes_cabana WHERE cabana_id = $1", [id]);
    
    console.log({
      reservas: resReservas.rows[0].count,
      paquetes: resPaquetes.rows[0].count,
      promos: resPromos.rows[0].count,
      imagenes: resImgs.rows[0].count
    });
  } catch(e) { console.error(e); } finally { process.exit(0); }
}
test();
