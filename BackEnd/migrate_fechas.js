import dotenv from 'dotenv';
import pg from 'pg';
dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  try {
    await pool.query("BEGIN");

    console.log("Eliminando vista_reservas temporalmente...");
    await pool.query("DROP VIEW IF EXISTS vista_reservas;");

    console.log("Alterando columnas llegada y salida a TIMESTAMP WITH TIME ZONE...");
    await pool.query(`
      ALTER TABLE reservas 
      ALTER COLUMN llegada TYPE TIMESTAMP WITH TIME ZONE,
      ALTER COLUMN salida TYPE TIMESTAMP WITH TIME ZONE;
    `);

    console.log("Recreando vista_reservas...");
    await pool.query(`
      CREATE VIEW vista_reservas AS
      SELECT r.reserva_id AS id,
        (((tp.nombre)::text || ' - '::text) || (p.nombre)::text) AS paquete,
        c.nombre AS cliente,
        c.contacto AS "Celular",
        c.numero_identificacion AS "Cédula",
        r.fecha_registro AS fecha,
        r.llegada,
        r.salida,
        r.estado,
        r.por_pagar AS "Pago restante",
        r.factura_url AS comprobante_url
      FROM (((reservas r
        JOIN clientes c ON ((c.cliente_id = r.cliente_id)))
        JOIN paquetes p ON ((p.paquete_id = r.paquete_id)))
        JOIN tipo_paquete tp ON ((tp.tipo_id = p.tipo_id)));
    `);

    await pool.query("COMMIT");
    console.log("Migración exitosa.");
  } catch (err) {
    await pool.query("ROLLBACK");
    console.error("Error migrando:", err.message);
  } finally {
    process.exit(0);
  }
}

migrate();
