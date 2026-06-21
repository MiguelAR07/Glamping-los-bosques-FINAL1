const { Client } = require('pg');
const client = new Client('postgres://postgres:miguel2006@localhost:5432/glamping');

client.connect()
  .then(async () => {
    try {
      const res = await client.query(`
        UPDATE paquetes SET
          cabana_id = COALESCE(NULLIF($1::text, '')::integer, cabana_id),
          tipo_id = COALESCE(NULLIF($2::text, '')::integer, tipo_id),
          dias_estadia = COALESCE(NULLIF($3::text, '')::integer, dias_estadia),
          descripcion = COALESCE(NULLIF($4, ''), descripcion),
          img_url = COALESCE(NULLIF($5, ''), img_url),
          precio_promocional = COALESCE(NULLIF($6::text, '')::numeric, precio_promocional),
          fecha_registro = CURRENT_DATE
        WHERE paquete_id = $7
        RETURNING paquete_id, fecha_registro
      `, [1, 4, 2, 'test update', '', 0, 10]); // We know id 10 exists from earlier

      console.log(res.rows);
    } catch (e) {
      console.error(e.message);
    }
  })
  .catch(console.error)
  .finally(() => client.end());
