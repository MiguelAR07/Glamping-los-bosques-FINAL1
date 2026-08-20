const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pool.query("SELECT pg_get_viewdef('vista_reservas')")
  .then(res => {
    console.log(res.rows[0].pg_get_viewdef);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
