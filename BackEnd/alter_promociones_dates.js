import 'dotenv/config';
import pool from './src/config/db.js';

async function migrate() {
  try {
    await pool.query("BEGIN");

    await pool.query(`
      ALTER TABLE Promociones 
      ADD COLUMN IF NOT EXISTS fecha_inicio DATE DEFAULT CURRENT_DATE,
      ADD COLUMN IF NOT EXISTS fecha_fin DATE;
    `);

    // Actualizar la vista para que incluya los nuevos campos
    await pool.query(`DROP VIEW IF EXISTS vista_promociones CASCADE;`);
    await pool.query(`
      CREATE VIEW vista_promociones AS
      SELECT 
        p.promocion_id AS id,
        p.nombre,
        p.descripcion,
        p.precio,
        p.img_url,
        p.fecha_inicio,
        p.fecha_fin,
        p.fecha_registro AS fecha,
        p.estado,
        COALESCE(
          (SELECT json_agg(json_build_object('id', c.cabana_id, 'nombre', c.nombre)) 
           FROM Promociones_Cabanas pc 
           JOIN Cabanas c ON c.cabana_id = pc.cabana_id 
           WHERE pc.promocion_id = p.promocion_id), '[]'::json
        ) AS cabanas
      FROM Promociones p;
    `);

    await pool.query("COMMIT");
    console.log("Columnas agregadas exitosamente.");
  } catch (error) {
    await pool.query("ROLLBACK");
    console.error("Error:", error);
  } finally {
    process.exit();
  }
}

migrate();
