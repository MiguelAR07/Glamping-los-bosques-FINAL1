const { Client } = require('pg');
const client = new Client('postgres://postgres:miguel2006@localhost:5432/glamping');

client.connect()
  .then(async () => {
    await client.query(`
      INSERT INTO paquetes (cabana_id, tipo_id, nombre, dias_estadia, descripcion, estado, fecha_registro)
      VALUES 
      (1, 4, 'Plan Fin de Semana', 2, 'Disfruta un fin de semana completo.', 'Activo', CURRENT_DATE),
      (1, 5, 'Plan Semana (L-V)', 4, 'Relájate entre semana.', 'Activo', CURRENT_DATE),
      (1, 6, 'Ocasional', 1, 'Plan de una noche.', 'Activo', CURRENT_DATE),
      (1, 7, 'Día de Sol', 1, 'Pasadía sin amanecida.', 'Activo', CURRENT_DATE)
    `);
    console.log('Paquetes agregados exitosamente');
  })
  .catch(console.error)
  .finally(() => client.end());
