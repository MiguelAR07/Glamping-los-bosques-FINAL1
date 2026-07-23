import pool from './src/config/db.js';

pool.query("SELECT column_name, is_nullable FROM information_schema.columns WHERE table_name = 'paquetes'")
  .then(res => { console.log(res.rows); process.exit(0); })
  .catch(console.error);
