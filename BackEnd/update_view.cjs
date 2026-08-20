const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const sql = `
CREATE OR REPLACE VIEW vista_reservas AS
 SELECT r.reserva_id AS id,
    (((tp.nombre)::text || ' - '::text) || (p.nombre)::text) AS paquete,
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
    r.adultos,
    r.ninos,
    r.mascotas,
    r.comprobante_saldo_url,
    r.estado_saldo,
    r.reserva_id,
    f.factura_id,
    (
        SELECT string_agg((s.nombre::text || ' ('::text) || sp.cantidad_personas || ')'::text, ', '::text)
        FROM (servicios_por_paquete sp
        JOIN servicios s ON ((s.servicio_id = sp.servicio_id)))
        WHERE (sp.paquete_id = r.paquete_id)
    ) AS "Servicios adicionales"
   FROM (((((reservas r
     JOIN clientes c ON ((c.cliente_id = r.cliente_id)))
     JOIN paquetes p ON ((p.paquete_id = r.paquete_id)))
     JOIN tipo_paquete tp ON ((tp.tipo_id = p.tipo_id)))
     JOIN cabanas cb ON ((cb.cabana_id = p.cabana_id)))
     LEFT JOIN facturas f ON ((f.reserva_id = r.reserva_id)));
`;

pool.query(sql)
  .then(res => {
    console.log("View updated");
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
