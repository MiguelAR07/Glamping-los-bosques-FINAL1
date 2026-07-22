import dotenv from 'dotenv';
import pg from 'pg';
dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function getPgTriggers() {
  try {
    const res = await pool.query("SELECT pg_get_triggerdef(oid) FROM pg_trigger WHERE tgrelid = 'reservas'::regclass OR tgrelid = 'facturas'::regclass OR tgrelid = 'paquetes'::regclass");
    console.log("TRIGGERS:");
    console.log(res.rows);
  } catch (err) {
    console.error(err.message);
  } finally {
    process.exit(0);
  }
}

getPgTriggers();
