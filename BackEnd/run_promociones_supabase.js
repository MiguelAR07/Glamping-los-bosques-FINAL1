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

    // 1. Eliminar Vistas relacionadas a Productos
    await client.query(`DROP VIEW IF EXISTS vista_productos_por_paquete CASCADE;`);
    await client.query(`DROP VIEW IF EXISTS vista_productos CASCADE;`);

    // 2. Eliminar Tablas de Productos
    await client.query(`DROP TABLE IF EXISTS Productos_Por_Paquete CASCADE;`);
    await client.query(`DROP TABLE IF EXISTS Productos CASCADE;`);

    // 3. Crear Tabla Promociones
    await client.query(`DROP TABLE IF EXISTS Promociones_Cabanas CASCADE;`);
    await client.query(`DROP TABLE IF EXISTS Promociones CASCADE;`);
    await client.query(`
      CREATE TABLE Promociones (
        promocion_id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        descripcion TEXT DEFAULT 'Sin descripcion',
        precio DECIMAL(10,2) NOT NULL,
        img_url TEXT,
        fecha_registro DATE DEFAULT CURRENT_DATE,
        estado VARCHAR(50) DEFAULT 'Activo',
        fecha_inicio DATE DEFAULT CURRENT_DATE,
        fecha_fin DATE
      );
    `);

    // 4. Crear Tabla Pivote Promociones_Cabanas
    await client.query(`
      CREATE TABLE IF NOT EXISTS Promociones_Cabanas (
        promocion_id INT NOT NULL REFERENCES Promociones(promocion_id) ON DELETE CASCADE,
        cabana_id INT NOT NULL REFERENCES Cabanas(cabana_id) ON DELETE CASCADE,
        PRIMARY KEY (promocion_id, cabana_id)
      );
    `);

    // 5. Crear Vista de Promociones con Cabañas agregadas
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
    console.log("✅ Migración de Promociones en Supabase completada exitosamente.");
    client.release();
  } catch (error) {
    console.error("❌ Error en migración:", error);
  } finally {
    pool.end();
  }
}

migrate();
