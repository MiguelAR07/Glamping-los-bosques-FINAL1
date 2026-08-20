require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkServiciosTable() {
  const resS = await pool.query("SELECT * FROM servicios");
  console.log('SERVICIOS BASE TABLE:', resS.rows);

  const resVS = await pool.query("SELECT * FROM vista_servicios");
  console.log('VISTA_SERVICIOS:', resVS.rows);

  pool.end();
}

checkServiciosTable().catch(console.error);
