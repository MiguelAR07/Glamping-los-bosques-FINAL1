import pool from './src/config/db.js';

async function test() {
  try {
    const res = await pool.query(`
      INSERT INTO clientes (nombre, email, contacto, tipo_identificacion, numero_identificacion, pais_residencia)
      VALUES ('Miguel', 'miguel@test.com', '123', 'CC', '1234567890', 'Colombia')
      ON CONFLICT (numero_identificacion) DO UPDATE 
      SET 
        nombre = EXCLUDED.nombre,
        email = EXCLUDED.email,
        contacto = EXCLUDED.contacto,
        tipo_identificacion = EXCLUDED.tipo_identificacion,
        pais_residencia = EXCLUDED.pais_residencia
      RETURNING cliente_id, nombre
    `);
    console.log(res.rows);
  } catch(e) { console.error(e); } finally { process.exit(0); }
}
test();
