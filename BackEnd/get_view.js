import pool from './src/config/db.js';

pool.query("SELECT pg_get_viewdef('vista_paquetes', true)")
  .then(res => { console.log(res.rows[0].pg_get_viewdef); process.exit(0); })
  .catch(console.error);
