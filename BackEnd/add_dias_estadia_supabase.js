import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({
  connectionString: 'postgresql://postgres.pxzhqxrdajlcahkvadsj:GlampingDB2026@aws-1-us-east-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function migrate() {
  try {
    const client = await pool.connect();
    await client.query("BEGIN");

    // Agregar la columna dias_estadia a la tabla Promociones
    await client.query(`
      ALTER TABLE Promociones 
      ADD COLUMN IF NOT EXISTS dias_estadia INT DEFAULT NULL;
    `);

    // Recrear la vista incluyendo la nueva columna
    await client.query(`DROP VIEW IF EXISTS vista_promociones CASCADE;`);
    await client.query(`
      CREATE VIEW vista_promociones AS
      SELECT 
        p.promocion_id AS id,
        p.nombre,
        p.descripcion,
        p.precio,
        p.img_url,
        p.fecha_inicio,
        p.fecha_fin,
        p.dias_estadia,
        p.fecha_registro AS fecha,
        CASE 
          WHEN p.fecha_fin IS NOT NULL AND p.fecha_fin < CURRENT_DATE THEN 'Inactivo' 
          ELSE p.estado 
        END AS estado,
        COALESCE(
          (SELECT json_agg(json_build_object('id', c.cabana_id, 'nombre', c.nombre)) 
           FROM Promociones_Cabanas pc 
           JOIN Cabanas c ON c.cabana_id = pc.cabana_id 
           WHERE pc.promocion_id = p.promocion_id), '[]'::json
        ) AS cabanas
      FROM Promociones p;
    `);

    await client.query("COMMIT");
    console.log("✅ Columna dias_estadia agregada y vista actualizada en Supabase.");
    client.release();
  } catch (error) {
    await pool.query("ROLLBACK");
    console.error("❌ Error en migración:", error);
  } finally {
    pool.end();
  }
}

migrate();
