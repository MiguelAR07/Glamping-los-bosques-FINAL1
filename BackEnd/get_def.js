import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function getDef() {
  const res = await pool.query("SELECT pg_get_viewdef('vista_reservas') as def");
  console.log(res.rows[0].def);
  pool.end();
}
getDef();
