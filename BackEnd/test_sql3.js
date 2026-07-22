import dotenv from 'dotenv';
import pg from 'pg';
dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function test() {
  try {
    const cabana_id_check = 1;
    const llegada = '2026-08-06T15:00:00.000Z'; // Valid timestamp
    const salida = '22:00:00'; // Invalid timestamp
    
    console.log("Testing overlap check with valid $2 and invalid $3...");
    const overlapCheck = await pool.query(`
        SELECT r.reserva_id 
        FROM reservas r
        JOIN paquetes p ON r.paquete_id = p.paquete_id
        WHERE p.cabana_id = $1
          AND r.estado NOT IN ('Cancelado', 'Cancelada')
          AND (r.llegada < $3 AND r.salida > $2)
    `, [cabana_id_check, llegada, salida]);
    
    console.log("Overlap Check Passed!");
  } catch(e) {
    console.error("ERROR:", e.message);
  } finally {
    process.exit(0);
  }
}

test();
