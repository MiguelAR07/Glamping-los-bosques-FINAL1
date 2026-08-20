require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function clearServices() {
  console.log('Eliminando todos los servicios adicionales asignados de la tabla servicios_por_paquete...');

  await pool.query("TRUNCATE TABLE servicios_por_paquete RESTART IDENTITY CASCADE");

  console.log('✅ servicios_por_paquete limpiado por completo.');

  const check = await pool.query('SELECT id, cliente, paquete, "Servicios adicionales" FROM vista_reservas');
  console.log('RESERVAS ACTUALES EN VISTA:', check.rows);

  pool.end();
}

clearServices().catch(console.error);
