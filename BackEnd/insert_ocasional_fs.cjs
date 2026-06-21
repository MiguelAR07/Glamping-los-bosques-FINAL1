const { Client } = require('pg');
const client = new Client('postgres://postgres:miguel2006@localhost:5432/glamping');

client.connect()
  .then(async () => {
    // 1. Insert "Ocasional Fin de Semana" into tipo_paquete
    let res = await client.query("SELECT tipo_id FROM tipo_paquete WHERE nombre = 'Ocasional Fin de Semana'");
    let tipoId;
    if (res.rowCount === 0) {
      res = await client.query("INSERT INTO tipo_paquete (nombre) VALUES ('Ocasional Fin de Semana') RETURNING tipo_id");
    }
    tipoId = res.rows[0].tipo_id;

    // 2. Select all cabins
    const resCabanas = await client.query('SELECT cabana_id, nombre FROM cabanas;');
    
    // 3. Insert packages
    for (const c of resCabanas.rows) {
      const resCheck = await client.query('SELECT 1 FROM paquetes WHERE cabana_id = $1 AND tipo_id = $2', [c.cabana_id, tipoId]);
      if (resCheck.rowCount === 0) {
        await client.query(`
          INSERT INTO paquetes (cabana_id, tipo_id, nombre, dias_estadia, descripcion, estado, fecha_registro, precio_promocional)
          VALUES ($1, $2, $3, 0, $4, 'Activo', CURRENT_DATE, 0)
        `, [c.cabana_id, tipoId, 'Paquete Ocasional Fin de Semana', 'Plan Ocasional de 6 horas para fin de semana.']);
      }
    }
    console.log("Paquetes Ocasional Fin de Semana creados.");
  })
  .catch(console.error)
  .finally(() => client.end());
