import pool from './src/config/db.js';

pool.query("SELECT * FROM vista_paquetes LIMIT 1")
  .then(res => { console.log(res.rows); process.exit(0); })
  .catch(console.error);
