const { Client } = require('pg');
const client = new Client('postgres://postgres:miguel2006@localhost:5432/glamping');

client.connect()
  .then(async () => {
    // Select the packages for Palmas (id=1) and Weekend (id=4)
    const res = await client.query('SELECT * FROM vista_paquetes WHERE cabana_id = 1 AND tipo_id = 4;');
    console.log("Paquetes encontrados:", res.rows);

    // Delete the one with precio = 700000
    const toDelete = res.rows.find(r => Number(r.precio) === 700000);
    
    if (toDelete) {
      await client.query('DELETE FROM paquetes WHERE paquete_id = $1', [toDelete.id]);
      console.log(`Paquete ${toDelete.id} eliminado correctamente.`);
    } else {
      console.log('No se encontró ningún paquete con precio 700000.');
    }
  })
  .catch(console.error)
  .finally(() => client.end());
