import dotenv from 'dotenv';
import pg from 'pg';
dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function checkTipoPaquete() {
  try {
    const res = await pool.query("SELECT * FROM tipo_paquete");
    console.log(res.rows);
  } catch (err) {
    console.error(err.message);
  } finally {
    process.exit(0);
  }
}

checkTipoPaquete();
