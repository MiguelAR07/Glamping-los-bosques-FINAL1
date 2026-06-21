const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'glamping',
  password: 'miguel2006',
  port: 5432,
});

pool.query("SELECT definition FROM pg_views WHERE viewname = 'vista_promociones'")
.then(res => {
  console.log(res.rows[0].definition);
  pool.end();
})
.catch(err => {
  console.error("Error:", err);
  pool.end();
});
