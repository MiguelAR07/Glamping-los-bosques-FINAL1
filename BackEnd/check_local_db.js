import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({
  connectionString: 'postgresql://postgres:miguel2006@localhost:5432/glamping'
});

async function check() {
  try {
    const res = await pool.query('SELECT nombre FROM cabanas');
    console.log("Cabañas locales:", res.rows);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    pool.end();
  }
}
check();
