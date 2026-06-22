import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({
  connectionString: 'postgresql://postgres.pxzhqxrdajlcahkvadsj:GlampingDB2026@aws-1-us-east-1.pooler.supabase.com:6543/postgres'
});

async function check() {
  try {
    const res = await pool.query(`SELECT * FROM login`);
    console.log("Logins:", res.rows);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    pool.end();
  }
}
check();
