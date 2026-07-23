import pool from './src/config/db.js';
const sql = `
  UPDATE paquetes SET
    cabana_id = COALESCE(NULLIF($1::text, '')::integer, cabana_id),
    tipo_id = COALESCE(NULLIF($2::text, '')::integer, tipo_id),
    dias_estadia = COALESCE(NULLIF($3::text, '')::integer, dias_estadia),
    descripcion = COALESCE(NULLIF($4, ''), descripcion),
    img_url = COALESCE(NULLIF($5, ''), img_url),
    precio_promocional = $6::numeric,
    fecha_registro = CURRENT_DATE
  WHERE paquete_id = $7
  RETURNING paquete_id
`;

pool.query(sql, [1, 1, 2, 'Prueba', null, 150000, 1])
  .then(res => { console.log('OK', res.rows); process.exit(0); })
  .catch(err => { console.error('ERROR', err.message); process.exit(1); });
