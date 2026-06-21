const { Client } = require('pg');
const client = new Client('postgres://postgres:miguel2006@localhost:5432/glamping');

client.connect()
  .then(async () => {
    const res = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'notificaciones';");
    console.log(res.rows);
  })
  .catch(console.error)
  .finally(() => client.end());
