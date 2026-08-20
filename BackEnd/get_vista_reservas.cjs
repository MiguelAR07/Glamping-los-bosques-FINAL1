require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function getViewDef() {
  const res = await pool.query("SELECT pg_get_viewdef('vista_reservas', true)");
  console.log(res.rows[0].pg_get_viewdef);
  pool.end();
}

getViewDef().catch(console.error);
