import dotenv from 'dotenv';
import pg from 'pg';
dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function checkFacturas() {
  try {
    const res = await pool.query("SELECT column_name, data_type, column_default, is_generated, generation_expression FROM information_schema.columns WHERE table_name = 'facturas'");
    console.log("FACTURAS SCHEMA:");
    console.log(res.rows);
  } catch (err) {
    console.error(err.message);
  } finally {
    process.exit(0);
  }
}

checkFacturas();
