import 'dotenv/config';
import pool from './src/config/db.js';

async function checkDb() {
  try {
    const cabanas = await pool.query('SELECT COUNT(*) FROM cabanas');
    const paquetes = await pool.query('SELECT COUNT(*) FROM paquetes');
    console.log(`Cabanas count: ${cabanas.rows[0].count}`);
    console.log(`Paquetes count: ${paquetes.rows[0].count}`);
  } catch (error) {
    console.error("DB Error:", error.message);
  } finally {
    process.exit();
  }
}
checkDb();
