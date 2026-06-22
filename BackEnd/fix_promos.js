import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({
  connectionString: 'postgresql://postgres.pxzhqxrdajlcahkvadsj:GlampingDB2026@aws-1-us-east-1.pooler.supabase.com:6543/postgres'
});

async function fix() {
  try {
    const res = await pool.query('DELETE FROM promociones WHERE length(img_url) > 10000 RETURNING *');
    console.log("Deleted promos:", res.rows.length);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    pool.end();
  }
}
fix();
