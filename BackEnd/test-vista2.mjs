import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  const res = await pool.query('SELECT "Servicios adicionales" FROM vista_reservas ORDER BY id DESC LIMIT 5');
  console.log(res.rows);
  process.exit(0);
}
run();
