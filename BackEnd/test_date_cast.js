import dotenv from 'dotenv';
import pg from 'pg';
dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function test() {
  try {
    console.log("Testing casting 22:00:00 to DATE...");
    await pool.query("SELECT CAST('22:00:00' AS DATE)");
    console.log("Casting to DATE passed.");
  } catch(e) {
    console.error("ERROR DATE:", e.message);
  } 

  try {
    console.log("Testing casting 22:00:00 to INTEGER...");
    await pool.query("SELECT CAST('22:00:00' AS INTEGER)");
    console.log("Casting to INTEGER passed.");
  } catch(e) {
    console.error("ERROR INTEGER:", e.message);
  } finally {
    process.exit(0);
  }
}

test();
