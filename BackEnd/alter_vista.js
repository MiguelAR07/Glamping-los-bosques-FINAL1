import pool from './src/config/db.js';

pool.query(`
  CREATE OR REPLACE VIEW vista_paquetes AS 
  SELECT 
    p.paquete_id AS id, 
    tp.nombre AS tipo, 
    c.nombre AS "Cabaña", 
    p.dias_estadia AS dias, 
    p.fecha_registro AS fecha, 
    p.descripcion, 
    p.estado, 
    p.tipo_id, 
    p.cabana_id, 
    p.img_url, 
    CASE
        WHEN p.precio_promocional > 0::numeric THEN p.precio_promocional
        ELSE c.precio_noche * p.dias_estadia::numeric
    END AS precio,
    p.precio_promocional
  FROM paquetes p 
  JOIN tipo_paquete tp ON p.tipo_id = tp.tipo_id 
  JOIN cabanas c ON p.cabana_id = c.cabana_id
`)
  .then(res => { console.log('Vista actualizada', res); process.exit(0); })
  .catch(console.error);
