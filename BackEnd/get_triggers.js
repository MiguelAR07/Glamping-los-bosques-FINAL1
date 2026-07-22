import dotenv from 'dotenv';
import pg from 'pg';
dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function getTriggers() {
  try {
    const res = await pool.query("SELECT trigger_name, event_object_table, action_statement FROM information_schema.triggers WHERE event_object_table = 'reservas'");
    console.log(res.rows);
  } catch (err) {
    console.error(err.message);
  } finally {
    process.exit(0);
  }
}

getTriggers();
