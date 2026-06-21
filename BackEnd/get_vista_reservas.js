import pg from 'pg';
const { Client } = pg;
const client = new Client({ connectionString: 'postgres://postgres:miguel2006@localhost:5432/glamping' });
await client.connect();
const res = await client.query("SELECT * FROM vista_reservas LIMIT 1;");
console.log(res.fields.map(f => f.name));
await client.end();
