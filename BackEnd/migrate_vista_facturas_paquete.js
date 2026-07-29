import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

const config = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
    }
  : {
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      host: process.env.DB_SERVER,
      database: process.env.DB_DATABASE,
      port: Number(process.env.DB_PORT),
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
    };

const pool = new Pool(config);

async function migrate() {
  try {
    console.log('Actualizando vista_facturas con alias minúsculos y LEFT JOINs...');

    await pool.query('DROP VIEW IF EXISTS vista_facturas CASCADE;');
    await pool.query(`
      CREATE OR REPLACE VIEW vista_facturas AS
      SELECT 
        f.factura_id AS id,
        f.reserva_id AS reserva,
        c.nombre AS cliente,
        COALESCE(cb.nombre, 'Sin cabaña') AS cabana,
        COALESCE(tp.nombre, 'Sin paquete') AS paquete,
        f.fecha_factura AS fecha,
        f.subtotal,
        COALESCE(f.descuento, 0) AS descuento,
        f.total
      FROM facturas f
      JOIN reservas r ON r.reserva_id = f.reserva_id
      JOIN clientes c ON c.cliente_id = r.cliente_id
      LEFT JOIN paquetes p ON p.paquete_id = r.paquete_id
      LEFT JOIN cabanas cb ON cb.cabana_id = p.cabana_id
      LEFT JOIN tipo_paquete tp ON tp.tipo_id = p.tipo_id
      WHERE r.estado NOT IN ('Cancelada', 'Cancelado');
    `);

    console.log('✅ vista_facturas actualizada correctamente.');

    // Verificar datos
    const result = await pool.query("SELECT * FROM vista_facturas LIMIT 5");
    console.log('Filas de vista_facturas:', result.rows);

  } catch (error) {
    console.error('❌ Error actualizando vista_facturas:', error);
  } finally {
    pool.end();
  }
}

migrate();
