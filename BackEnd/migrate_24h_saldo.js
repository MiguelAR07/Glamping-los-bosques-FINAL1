import pg from 'pg';
const { Pool } = pg;
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function migrate() {
  try {
    console.log("Updating vista_reservas...");
    await pool.query(`
      DROP VIEW IF EXISTS vista_reservas;
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
               FROM (servicios_por_paquete sp
                 JOIN vista_servicios s ON ((sp.servicio_id = s.id)))
              WHERE (sp.paquete_id = p.paquete_id)), 'Ninguno'::text) AS "Servicios adicionales",
        r.adultos,
        r.ninos,
        r.mascotas,
        r.comprobante_saldo_url,
        r.estado_saldo,
        r.recordatorio_24h_enviado,
        r.reserva_id
       FROM (((reservas r
         JOIN clientes c ON ((c.cliente_id = r.cliente_id)))
         JOIN paquetes p ON ((p.paquete_id = r.paquete_id)))
         JOIN tipo_paquete tp ON ((tp.tipo_id = p.tipo_id)));
    `);
    
    console.log("Migration OK");
  } catch (e) {
    console.error("Migration failed:", e);
  } finally {
    pool.end();
  }
}

migrate();
