import pg from 'pg';
const { Client } = pg;
const client = new Client({ connectionString: 'postgres://postgres:miguel2006@localhost:5432/glamping' });
await client.connect();
const res = await client.query("SELECT cabana_id, nombre FROM Cabanas;");
console.table(res.rows);
await client.end();
