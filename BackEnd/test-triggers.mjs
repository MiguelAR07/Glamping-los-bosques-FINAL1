import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  const res = await pool.query("SELECT event_object_table, trigger_name FROM information_schema.triggers WHERE event_object_table IN ('servicios_por_paquete', 'reservas');");
  console.log(res.rows);
  process.exit(0);
}
run();
