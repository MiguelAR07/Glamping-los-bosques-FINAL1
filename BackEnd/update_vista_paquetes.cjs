const { Client } = require('pg');
const client = new Client('postgres://postgres:miguel2006@localhost:5432/glamping');

client.connect()
  .then(async () => {
    // Drop both views
    await client.query('DROP VIEW IF EXISTS vista_paquetes_stats CASCADE;');
    await client.query('DROP VIEW IF EXISTS vista_paquetes CASCADE;');
    
    // Recreate vista_paquetes
    await client.query(`
      CREATE VIEW vista_paquetes AS
      SELECT p.paquete_id AS id,
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
          WHEN p.precio_promocional > 0 THEN p.precio_promocional
          ELSE c.precio_noche * p.dias_estadia
        END AS precio
      FROM paquetes p
        JOIN tipo_paquete tp ON tp.tipo_id = p.tipo_id
        JOIN cabanas c ON c.cabana_id = p.cabana_id;
    `);

    // Recreate vista_paquetes_stats
    await client.query(`
      CREATE VIEW vista_paquetes_stats AS
      SELECT p.paquete_id AS id,
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
          WHEN p.precio_promocional > 0 THEN p.precio_promocional
          ELSE c.precio_noche * p.dias_estadia
        END AS precio,
        count(r.reserva_id) AS veces_reservado
      FROM paquetes p
        JOIN tipo_paquete tp ON tp.tipo_id = p.tipo_id
        JOIN cabanas c ON c.cabana_id = p.cabana_id
        LEFT JOIN reservas r ON p.paquete_id = r.paquete_id
      GROUP BY p.paquete_id, tp.nombre, c.nombre, p.dias_estadia, p.fecha_registro, p.descripcion, p.estado, p.tipo_id, p.cabana_id, p.img_url, p.precio_promocional, c.precio_noche;
    `);

    console.log('vista_paquetes actualizada exitosamente');
  })
  .catch(console.error)
  .finally(() => client.end());
