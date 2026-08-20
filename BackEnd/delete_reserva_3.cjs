require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function deleteReserva3() {
  console.log('Eliminando definitivamente la Reserva #3...');

  // 1. Obtener paquete y factura id
  const rRes = await pool.query("SELECT paquete_id FROM reservas WHERE reserva_id = 3");
  const pkgId = rRes.rows.length > 0 ? rRes.rows[0].paquete_id : null;

  // 2. Eliminar pagos
  await pool.query("DELETE FROM pagos WHERE factura_id IN (SELECT factura_id FROM facturas WHERE reserva_id = 3)");

  // 3. Eliminar facturas
  await pool.query("DELETE FROM facturas WHERE reserva_id = 3");

  // 4. Eliminar servicios_por_paquete
  if (pkgId) {
    await pool.query("DELETE FROM servicios_por_paquete WHERE paquete_id = $1", [pkgId]);
  }

  // 5. Eliminar reserva
  await pool.query("DELETE FROM reservas WHERE reserva_id = 3");

  console.log('✅ Reserva #3 eliminada definitivamente.');

  const check = await pool.query(`
    SELECT id, cliente, subtotal AS "Precio Total", "Total abonado", "Pago restante" AS "Total Restante" 
    FROM vista_reservas 
    ORDER BY id ASC
  `);
  console.log('RESERVAS RESTANTES EN BASE DE DATOS:', check.rows);

  pool.end();
}

deleteReserva3().catch(console.error);
