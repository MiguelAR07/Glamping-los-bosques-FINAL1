require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function moveDecoration() {
  console.log('Moviendo la decoración exclusivamente a la Reserva 3 (miguel)...');

  // Limpiar servicios_por_paquete
  await pool.query("TRUNCATE TABLE servicios_por_paquete RESTART IDENTITY CASCADE");

  // Asignar Decoración Aniversario (Especial) [servicio_id 4] al paquete_id 113 (Reserva 3 de miguel)
  await pool.query("INSERT INTO servicios_por_paquete (paquete_id, servicio_id, cantidad_personas) VALUES (113, 4, 1)");

  console.log('✅ Decoración asignada a Reserva 3 (miguel).');

  const check = await pool.query('SELECT id, cliente, paquete, "Servicios adicionales" FROM vista_reservas ORDER BY id ASC');
  console.log('ESTADO FINAL DE RESERVAS Y SERVICIOS:', check.rows);

  pool.end();
}

moveDecoration().catch(console.error);
