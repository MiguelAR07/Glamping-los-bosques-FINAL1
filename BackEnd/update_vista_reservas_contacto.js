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

async function updateView() {
  try {
    await pool.query('DROP VIEW IF EXISTS vista_reservas CASCADE;');
    await pool.query(`
      CREATE OR REPLACE VIEW vista_reservas AS
      SELECT r.reserva_id AS id,
        tp.nombre || ' - ' || p.nombre AS paquete,
        cb.nombre AS cabana,
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
               FROM (servicios_por_paquete sp
                 JOIN vista_servicios s ON ((sp.servicio_id = s.id)))
              WHERE (sp.paquete_id = p.paquete_id)), 'Ninguno'::text) AS "Servicios adicionales",
        r.adultos,
        r.ninos,
        r.mascotas,
        r.comprobante_saldo_url,
        r.estado_saldo,
        r.reserva_id
      FROM reservas r
        JOIN clientes c ON c.cliente_id = r.cliente_id
        JOIN paquetes p ON p.paquete_id = r.paquete_id
        JOIN tipo_paquete tp ON tp.tipo_id = p.tipo_id
        JOIN cabanas cb ON cb.cabana_id = p.cabana_id;
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
    
    console.log('vista_reservas actualizada correctamente con Celular y Cédula.');
  } catch (error) {
    console.error('Error actualizando vista:', error);
  } finally {
    pool.end();
  }
}

updateView();
