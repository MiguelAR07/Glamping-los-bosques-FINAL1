import dotenv from 'dotenv';
import pg from 'pg';
dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function getProc() {
  try {
    const res = await pool.query("SELECT prosrc FROM pg_proc WHERE proname = 'fn_calcular_total_factura'");
    console.log(res.rows[0].prosrc);
  } catch (err) {
    console.error(err.message);
  } finally {
    process.exit(0);
  }
}

getProc();
