import pg from 'pg';
import fs from 'fs';
import path from 'path';

const { Pool } = pg;

const pool = new Pool({
  connectionString: 'postgresql://postgres:GlampingDB2026@db.pxzhqxrdajlcahkvadsj.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function setupSupabase() {
  try {
    console.log("Conectando a Supabase...");
    const client = await pool.connect();
    console.log("Conectado exitosamente.");

    const scripts = [
      '../Model/GlampingDB.sql',
      '../Model/Inserccion_GlampingDB.sql',
      '../Model/Views_GlampingDB.sql',
      '../Model/Triggers_GlampingDB.sql'
    ];

    for (const scriptPath of scripts) {
      console.log(`Ejecutando ${scriptPath}...`);
      const fullPath = path.resolve(scriptPath);
      const sql = fs.readFileSync(fullPath, 'utf8');
      
      // Execute the SQL. Some scripts might have statements that fail if they already exist, 
      // but since it's a fresh DB it should be fine.
      await client.query(sql);
      console.log(`✅ ${scriptPath} ejecutado con éxito.`);
    }

    client.release();
    console.log("¡Base de datos construida completamente en Supabase!");
  } catch (err) {
    console.error("Error ejecutando script:", err);
  } finally {
    pool.end();
  }
}

setupSupabase();
