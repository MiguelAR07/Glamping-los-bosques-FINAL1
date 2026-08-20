require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function separatePackages() {
  console.log('Creando paquete exclusivo para la Reserva 3 (miguel)...');

  // 1. Crear un paquete independiente para Reserva 3
  const newPkg = await pool.query(`
    INSERT INTO paquetes (cabana_id, tipo_id, nombre, dias_estadia, estado) 
    VALUES (3, 4, 'Reserva - Cabaña Roble (Miguel)', 1, 'Activo')
    RETURNING paquete_id;
  `);
  const nuevoPkgId = newPkg.rows[0].paquete_id;

  // 2. Asignar el nuevo paquete a la Reserva 3
  await pool.query("UPDATE reservas SET paquete_id = $1 WHERE reserva_id = 3", [nuevoPkgId]);

  // 3. Limpiar servicios_por_paquete y asignar la Decoración Aniversario (Especial) ÚNICAMENTE al nuevoPkgId
  await pool.query("TRUNCATE TABLE servicios_por_paquete RESTART IDENTITY CASCADE");
  await pool.query("INSERT INTO servicios_por_paquete (paquete_id, servicio_id, cantidad_personas) VALUES ($1, 4, 1)", [nuevoPkgId]);

  console.log('✅ Paquete independiente creado y Decoración asignada EXCLUSIVAMENTE a miguel.');

  const check = await pool.query('SELECT id, cliente, paquete, "Servicios adicionales" FROM vista_reservas ORDER BY id ASC');
  console.log('ESTADO DEFINITIVO DE RESERVAS Y SERVICIOS:', check.rows);

  pool.end();
}

separatePackages().catch(console.error);
