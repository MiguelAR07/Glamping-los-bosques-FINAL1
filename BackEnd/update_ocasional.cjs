const { Client } = require('pg');
const client = new Client('postgres://postgres:miguel2006@localhost:5432/glamping');

client.connect()
  .then(async () => {
    // Buscar los paquetes "Ocasional" (tipo_id = 6)
    const res = await client.query("UPDATE paquetes SET dias_estadia = 0, descripcion = 'Plan Ocasional de 6 horas.' WHERE tipo_id = 6;");
    console.log(`Paquetes Ocasionales actualizados: ${res.rowCount}`);
  })
  .catch(console.error)
  .finally(() => client.end());
