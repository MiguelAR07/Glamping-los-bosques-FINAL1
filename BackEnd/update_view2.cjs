const { Client } = require('pg');
const client = new Client('postgres://postgres:miguel2006@localhost:5432/glamping');

client.connect()
  .then(() => client.query('DROP VIEW IF EXISTS vista_reservas CASCADE;'))
  .then(() => client.query(`
    CREATE OR REPLACE VIEW vista_reservas AS
    SELECT r.reserva_id AS id,
      tp.nombre || ' - ' || p.nombre AS paquete,
      c.nombre AS cliente,
      r.fecha_registro AS fecha,
      r.llegada,
      r.salida,
      r.estado,
      r.por_pagar AS "Pago restante",
      r.factura_url AS comprobante_url
    FROM reservas r
      JOIN clientes c ON c.cliente_id = r.cliente_id
      JOIN paquetes p ON p.paquete_id = r.paquete_id
      JOIN tipo_paquete tp ON tp.tipo_id = p.tipo_id;
  `))
  .then(() => client.query(`
    CREATE OR REPLACE VIEW vista_reservas_revenue AS
    SELECT
      TO_CHAR(f.fecha_factura, 'YYYY-MM-DD') AS fecha,
      SUM(f.total) AS total
    FROM reservas r
    JOIN facturas f ON f.reserva_id = r.reserva_id
    WHERE r.estado <> 'Cancelada'
    GROUP BY TO_CHAR(f.fecha_factura, 'YYYY-MM-DD');
  `))
  .then(() => console.log('View updated successfully'))
  .catch(console.error)
  .finally(() => client.end());
