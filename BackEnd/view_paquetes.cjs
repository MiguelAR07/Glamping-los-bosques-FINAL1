const { Client } = require('pg');
const client = new Client('postgres://postgres:miguel2006@localhost:5432/glamping');

client.connect()
  .then(async () => {
    const r = await client.query('SELECT * FROM vista_paquetes LIMIT 1;');
    console.log(r.rows);
  })
  .catch(console.error)
  .finally(() => client.end());
