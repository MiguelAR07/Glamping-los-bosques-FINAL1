import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;
const config = {
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres.pxzhqxrdajlcahkvadsj:miguel2006@aws-1-us-east-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
};

const pool = new Pool(config);

async function run() {
  try {
    await pool.query('DROP VIEW IF EXISTS vista_reservas CASCADE;');
    await pool.query('ALTER TABLE reservas ALTER COLUMN llegada TYPE TIMESTAMP;');
    await pool.query('ALTER TABLE reservas ALTER COLUMN salida TYPE TIMESTAMP;');
    await pool.query(`
CREATE OR REPLACE VIEW vista_reservas AS
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
    r.factura_url AS comprobante_url,
    COALESCE(( SELECT string_agg(((((s.servicio)::text || ' ('::text) || sp.cantidad_personas) || ' pax)'::text), ', '::text) AS string_agg
           FROM (public.servicios_por_paquete sp
             JOIN public.vista_servicios s ON ((sp.servicio_id = s.id)))
          WHERE (sp.paquete_id = p.paquete_id)), 'Ninguno'::text) AS "Servicios adicionales"
   FROM (((public.reservas r
     JOIN public.clientes c ON ((c.cliente_id = r.cliente_id)))
     JOIN public.paquetes p ON ((p.paquete_id = r.paquete_id)))
     JOIN public.tipo_paquete tp ON ((tp.tipo_id = p.tipo_id)));
    `);
    
    await pool.query(`
      CREATE OR REPLACE VIEW vista_reservas_revenue AS
      SELECT
        TO_CHAR(f.fecha_factura, 'YYYY-MM-DD') AS fecha,
        SUM(f.total) AS total
      FROM reservas r
      JOIN facturas f ON f.reserva_id = r.reserva_id
      WHERE r.estado <> 'Cancelada'
      GROUP BY TO_CHAR(f.fecha_factura, 'YYYY-MM-DD');
    `);
    
    console.log("Database altered and views recreated successfully!");
  } catch (error) {
    console.error(error);
  } finally {
    pool.end();
  }
}

run();
