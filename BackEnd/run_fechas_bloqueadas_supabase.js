import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({
  connectionString: 'postgresql://postgres.pxzhqxrdajlcahkvadsj:GlampingDB2026@aws-1-us-east-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function migrate() {
  try {
    const client = await pool.connect();
    await client.query(`
      CREATE TABLE IF NOT EXISTS fechas_bloqueadas (
          id SERIAL PRIMARY KEY,
          cabana_id INT REFERENCES Cabanas(cabana_id) ON DELETE CASCADE,
          fecha_inicio DATE NOT NULL,
          fecha_fin DATE NOT NULL,
          motivo VARCHAR(255) NOT NULL,
          fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ Tabla 'fechas_bloqueadas' creada en Supabase exitosamente.");
    client.release();
  } catch (error) {
    console.error("❌ Error en migración:", error);
  } finally {
    pool.end();
  }
}

migrate();
