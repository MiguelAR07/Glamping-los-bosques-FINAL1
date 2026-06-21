const { Client } = require('pg');
const client = new Client('postgres://postgres:miguel2006@localhost:5432/glamping');

client.connect()
  .then(async () => {
    const r = await client.query("SELECT pg_get_viewdef('vista_paquetes', true)");
    console.log(r.rows[0].pg_get_viewdef);
  })
  .catch(console.error)
  .finally(() => client.end());
