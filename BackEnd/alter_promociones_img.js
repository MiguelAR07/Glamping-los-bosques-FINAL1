const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'glamping',
  password: 'miguel2006',
  port: 5432,
});

pool.query(`
  ALTER TABLE Promociones
  ALTER COLUMN img_url TYPE TEXT;
`)
.then(() => {
  console.log("Columna img_url alterada a TEXT exitosamente.");
  pool.end();
})
.catch(err => {
  console.error("Error alterando tabla:", err);
  pool.end();
});
