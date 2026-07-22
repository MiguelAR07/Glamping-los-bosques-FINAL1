import dotenv from 'dotenv';
import pg from 'pg';
dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function checkSchema() {
  try {
    const res = await pool.query("SELECT column_name, data_type, column_default, is_nullable FROM information_schema.columns WHERE table_name = 'paquetes'");
    console.log(res.rows);
  } catch (err) {
    console.error(err.message);
  } finally {
    process.exit(0);
  }
}

checkSchema();
