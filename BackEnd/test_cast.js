import dotenv from 'dotenv';
import pg from 'pg';
dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function test() {
  try {
    const res = await pool.query("SELECT CAST('22:00:00' AS TIMESTAMP WITH TIME ZONE)");
    console.log(res.rows);
  } catch (err) {
    console.error(err.message);
  } finally {
    process.exit(0);
  }
}

test();
