import dotenv from 'dotenv';
import pg from 'pg';
dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function checkGenerated() {
  try {
    const res = await pool.query("SELECT column_name, is_generated, generation_expression FROM information_schema.columns WHERE table_name = 'paquetes'");
    console.log("PAQUETES:", res.rows);
  } catch (err) {
    console.error(err.message);
  } finally {
    process.exit(0);
  }
}

checkGenerated();
