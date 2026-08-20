require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function addDecoration() {
  console.log('Asignando Decoración Aniversario (Especial) exclusivamente a la Reserva 2 (SALOMÉ PATIÑO, paquete 106)...');

  await pool.query("INSERT INTO servicios_por_paquete (paquete_id, servicio_id, cantidad_personas) VALUES (106, 4, 1)");

  console.log('✅ Decoración asignada a Reserva 2.');

  const check = await pool.query('SELECT id, cliente, paquete, "Servicios adicionales" FROM vista_reservas ORDER BY id ASC');
  console.log('ESTADO DE RESERVAS Y SERVICIOS:', check.rows);

  pool.end();
}

addDecoration().catch(console.error);
