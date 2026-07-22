import dotenv from 'dotenv';
import pg from 'pg';
dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function getViews() {
  try {
    const res = await pool.query(`
      SELECT distinct dependent_view.relname as view_name
      FROM pg_depend 
      JOIN pg_rewrite ON pg_depend.objid = pg_rewrite.oid 
      JOIN pg_class as dependent_view ON pg_rewrite.ev_class = dependent_view.oid 
      JOIN pg_class as source_table ON pg_depend.refobjid = source_table.oid 
      JOIN pg_attribute ON pg_depend.refobjid = pg_attribute.attrelid 
        AND pg_depend.refobjsubid = pg_attribute.attnum 
      WHERE source_table.relname = 'reservas' 
        AND pg_attribute.attname IN ('llegada', 'salida')
        AND dependent_view.relkind = 'v';
    `);
    
    console.log(res.rows);

    for (let row of res.rows) {
      const defRes = await pool.query(`SELECT pg_get_viewdef('${row.view_name}') as def`);
      console.log(`VIEW ${row.view_name}:`);
      console.log(defRes.rows[0].def);
    }
  } catch (err) {
    console.error(err.message);
  } finally {
    process.exit(0);
  }
}

getViews();
