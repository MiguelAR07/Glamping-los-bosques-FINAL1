import pool from './src/config/db.js';

const sql = `
CREATE OR REPLACE VIEW vista_facturas AS 
SELECT 
    f.factura_id AS id, 
    r.reserva_id AS reserva, 
    c.nombre AS cliente, 
    f.fecha_factura AS fecha, 
    f.subtotal, 
    f.total_restante AS total 
FROM facturas f 
JOIN reservas r ON f.reserva_id = r.reserva_id 
JOIN clientes c ON r.cliente_id = c.cliente_id 
WHERE r.estado = 'Confirmado';
`;

pool.query(sql)
  .then(() => {
    console.log('vista_facturas updated to only show confirmed reservations');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
