const { Client } = require('pg');
const client = new Client('postgres://postgres:miguel2006@localhost:5432/glamping');

client.connect()
  .then(async () => {
    // Select all cabins
    const resCabanas = await client.query('SELECT cabana_id, nombre FROM cabanas;');
    const cabanas = resCabanas.rows;

    // Select all package types
    const resTipos = await client.query('SELECT tipo_id, nombre FROM tipo_paquete;');
    const tipos = resTipos.rows;

    // Define standard duration and descriptions for each type if possible, or just default values.
    const getDias = (tipoNombre) => {
      const n = tipoNombre.toLowerCase();
      if (n.includes('semana (l - v)')) return 4;
      if (n.includes('fin de semana')) return 2;
      return 1;
    };

    let inserted = 0;
    for (const c of cabanas) {
      for (const t of tipos) {
        // Check if package already exists for this cabin and type
        const resCheck = await client.query('SELECT 1 FROM paquetes WHERE cabana_id = $1 AND tipo_id = $2', [c.cabana_id, t.tipo_id]);
        
        if (resCheck.rowCount === 0) {
          const dias = getDias(t.nombre);
          const desc = `Paquete ${t.nombre} para ${c.nombre}.`;
          const nombre = `Paquete ${t.nombre}`;
          
          await client.query(`
            INSERT INTO paquetes (cabana_id, tipo_id, nombre, dias_estadia, descripcion, estado, fecha_registro, precio_promocional)
            VALUES ($1, $2, $3, $4, $5, 'Activo', CURRENT_DATE, 0)
          `, [c.cabana_id, t.tipo_id, nombre, dias, desc]);
          inserted++;
        }
      }
    }
    
    console.log(`Se insertaron ${inserted} nuevos paquetes.`);
  })
  .catch(console.error)
  .finally(() => client.end());
