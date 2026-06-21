import 'dotenv/config';
import pool from './src/config/db.js';

async function migrate() {
  try {
    await pool.query("BEGIN");

    // 1. Eliminar Vistas relacionadas a Productos
    await pool.query(`DROP VIEW IF EXISTS vista_productos_por_paquete CASCADE;`);
    await pool.query(`DROP VIEW IF EXISTS vista_productos CASCADE;`);

    // 2. Eliminar Tablas de Productos
    await pool.query(`DROP TABLE IF EXISTS Productos_Por_Paquete CASCADE;`);
    await pool.query(`DROP TABLE IF EXISTS Productos CASCADE;`);

    // 3. Crear Tabla Promociones
    await pool.query(`DROP TABLE IF EXISTS Promociones_Cabanas CASCADE;`);
    await pool.query(`DROP TABLE IF EXISTS Promociones CASCADE;`);
    await pool.query(`
      CREATE TABLE Promociones (
        promocion_id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        descripcion TEXT DEFAULT 'Sin descripcion',
        precio DECIMAL(10,2) NOT NULL,
        img_url TEXT,
        fecha_registro DATE DEFAULT CURRENT_DATE,
        estado VARCHAR(50) DEFAULT 'Activo'
      );
    `);

    // 4. Crear Tabla Pivote Promociones_Cabanas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS Promociones_Cabanas (
        promocion_id INT NOT NULL REFERENCES Promociones(promocion_id) ON DELETE CASCADE,
        cabana_id INT NOT NULL REFERENCES Cabanas(cabana_id) ON DELETE CASCADE,
        PRIMARY KEY (promocion_id, cabana_id)
      );
    `);

    // 5. Crear Vista de Promociones con Cabañas agregadas
    await pool.query(`
      CREATE OR REPLACE VIEW vista_promociones AS
      SELECT 
        p.promocion_id AS id,
        p.nombre,
        p.descripcion,
        p.precio,
        p.img_url,
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
    console.log("Migración completada exitosamente.");
  } catch (error) {
    await pool.query("ROLLBACK");
    console.error("Error en migración:", error);
  } finally {
    process.exit();
  }
}

migrate();
