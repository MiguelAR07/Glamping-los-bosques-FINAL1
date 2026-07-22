import dotenv from 'dotenv';
import pg from 'pg';
dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function checkDefaults() {
  try {
    const res = await pool.query("SELECT column_name, column_default FROM information_schema.columns WHERE table_name = 'paquetes'");
    console.log("PAQUETES:", res.rows);
    const res2 = await pool.query("SELECT column_name, column_default FROM information_schema.columns WHERE table_name = 'reservas'");
    console.log("RESERVAS:", res2.rows);
  } catch (err) {
    console.error(err.message);
  } finally {
    process.exit(0);
  }
}

checkDefaults();
