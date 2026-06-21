import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Client } = pg;
const client = new Client({ connectionString: process.env.DATABASE_URL || 'postgres://postgres:miguel2006@localhost:5432/glamping' });

async function query() {
    await client.connect();
    const res = await client.query(`
        SELECT definition
        FROM pg_views
        WHERE viewname = 'vista_reservas';
    `);
    console.log(res.rows[0].definition);
    await client.end();
}

query();
