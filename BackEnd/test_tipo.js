import pool from './src/config/db.js';

pool.query('SELECT * FROM tipo_paquete')
  .then(res => { console.log(res.rows); process.exit(0); })
  .catch(console.error);
