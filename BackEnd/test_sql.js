import dotenv from 'dotenv';
import pg from 'pg';
dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function test() {
  try {
    const cabana_id_check = 1;
    const llegada = '2026-08-06T15:00:00.000Z';
    const salida = '2026-08-06T22:00:00.000Z';
    
    console.log("Testing overlap check...");
    const overlapCheck = await pool.query(`
        SELECT r.reserva_id 
        FROM reservas r
        JOIN paquetes p ON r.paquete_id = p.paquete_id
        WHERE p.cabana_id = $1
          AND r.estado NOT IN ('Cancelado', 'Cancelada')
          AND (r.llegada < $3 AND r.salida > $2)
    `, [cabana_id_check, llegada, salida]);
    
    console.log("Overlap Check Passed!");

    console.log("Testing createReservation query...");
    const reservationResult = await pool.query(`
      INSERT INTO reservas (paquete_id, cliente_id, fecha_registro, llegada, salida, estado, por_pagar, factura_url)
      SELECT
          1,
          1,
          CURRENT_TIMESTAMP,
          $1,
          $2,
          'Por validar',
          50000,
          null
      WHERE 1 = 2
      RETURNING reserva_id;
    `, [llegada, salida]);
    console.log("Create Reservation Passed!");
    
  } catch(e) {
    console.error("ERROR:", e.message);
  } finally {
    process.exit(0);
  }
}

test();
