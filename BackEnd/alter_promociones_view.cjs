const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'glamping',
  password: 'miguel2006',
  port: 5432,
});

const sql = `
  DROP VIEW vista_promociones;
  ALTER TABLE Promociones ALTER COLUMN img_url TYPE TEXT;
  CREATE OR REPLACE VIEW vista_promociones AS
   SELECT promocion_id AS id,
      nombre,
      descripcion,
      precio,
      img_url,
      fecha_inicio,
      fecha_fin,
      fecha_registro AS fecha,
      estado,
      COALESCE(( SELECT json_agg(json_build_object('id', c.cabana_id, 'nombre', c.nombre)) AS json_agg
             FROM (promociones_cabanas pc
               JOIN cabanas c ON ((c.cabana_id = pc.cabana_id)))
            WHERE (pc.promocion_id = p.promocion_id)), '[]'::json) AS cabanas
     FROM promociones p;
`;

pool.query(sql)
.then(() => {
  console.log("Tabla alterada y vista recreada con exito.");
  pool.end();
})
.catch(err => {
  console.error("Error:", err);
  pool.end();
});
