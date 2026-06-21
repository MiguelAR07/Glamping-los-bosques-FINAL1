import 'dotenv/config';
import pool from './src/config/db.js';

async function testPaquetes() {
  try {
    const res = await pool.query(`
    SELECT
      * 
    FROM vista_paquetes
    WHERE estado = 'Activo'
    ORDER BY fecha DESC
    `);
    console.log("Success! Found rows:", res.rows);
  } catch (error) {
    console.error("DB Error:", error.message);
  } finally {
    process.exit();
  }
}
testPaquetes();
