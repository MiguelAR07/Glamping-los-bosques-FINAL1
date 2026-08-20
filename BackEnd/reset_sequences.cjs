const { Pool } = require('pg');
require('dotenv').config();

const queries = [
  // 1. Create a generic function that resets the sequence for any table
  // based on TG_TABLE_NAME and the convention table_col_seq
  `CREATE OR REPLACE FUNCTION reset_sequence_on_delete()
   RETURNS TRIGGER AS $$
   DECLARE
     seq_name text;
     max_id integer;
     col_name text;
   BEGIN
     -- Determine column name based on table name (e.g., reservas -> reserva_id)
     IF TG_TABLE_NAME = 'reservas' THEN col_name := 'reserva_id';
     ELSIF TG_TABLE_NAME = 'facturas' THEN col_name := 'factura_id';
     ELSIF TG_TABLE_NAME = 'pagos' THEN col_name := 'pago_id';
     ELSE RETURN OLD;
     END IF;

     seq_name := TG_TABLE_NAME || '_' || col_name || '_seq';
     
     EXECUTE format('SELECT COALESCE(MAX(%I), 0) FROM %I', col_name, TG_TABLE_NAME) INTO max_id;
     
     IF max_id = 0 THEN
       EXECUTE format('SELECT setval(%L, 1, false)', seq_name);
     ELSE
       EXECUTE format('SELECT setval(%L, %s)', seq_name, max_id);
     END IF;

     RETURN OLD;
   END;
   $$ LANGUAGE plpgsql;`,

  // 2. Drop existing triggers if any
  `DROP TRIGGER IF EXISTS trg_reset_seq_reservas ON reservas;`,
  `DROP TRIGGER IF EXISTS trg_reset_seq_facturas ON facturas;`,
  `DROP TRIGGER IF EXISTS trg_reset_seq_pagos ON pagos;`,

  // 3. Create triggers
  `CREATE TRIGGER trg_reset_seq_reservas
   AFTER DELETE ON reservas
   FOR EACH STATEMENT
   EXECUTE FUNCTION reset_sequence_on_delete();`,

  `CREATE TRIGGER trg_reset_seq_facturas
   AFTER DELETE ON facturas
   FOR EACH STATEMENT
   EXECUTE FUNCTION reset_sequence_on_delete();`,

  `CREATE TRIGGER trg_reset_seq_pagos
   AFTER DELETE ON pagos
   FOR EACH STATEMENT
   EXECUTE FUNCTION reset_sequence_on_delete();`
];

async function updateDb(connectionString, name) {
  const pool = new Pool({
    connectionString,
    ssl: connectionString.includes('localhost') || connectionString.includes('127.0.0.1') ? false : { rejectUnauthorized: false }
  });

  try {
    for (const q of queries) {
      await pool.query(q);
    }
    console.log(`[OK] ${name}: triggers aplicados correctamente.`);
  } catch (err) {
    console.error(`[Error] ${name}:`, err.message);
  } finally {
    await pool.end();
  }
}

async function main() {
  if (process.env.DATABASE_URL) {
    await updateDb(process.env.DATABASE_URL, 'Supabase DB');
  }
  const localUrl = 'postgresql://postgres:miguel2006@localhost:5432/glamping';
  await updateDb(localUrl, 'Local Postgres');
}

main();
