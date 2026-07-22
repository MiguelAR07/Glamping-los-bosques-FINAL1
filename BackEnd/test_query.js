import dotenv from 'dotenv';
import pg from 'pg';
dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function testQuery() {
  try {
    const q = `
                SELECT r.reserva_id 
                FROM reservas r
                JOIN paquetes p ON r.paquete_id = p.paquete_id
                WHERE p.cabana_id = $1
                  AND r.estado NOT IN ('Cancelado', 'Cancelada')
                  AND (r.llegada < $3 AND r.salida > $2)
    `;
    const res = await pool.query(q, [1, '2026-08-06T15:00:00.000Z', '2026-08-06T23:00:00.000Z']);
    console.log("SUCCESS");
  } catch (err) {
    console.error("ERROR:", err.message);
  } finally {
    process.exit(0);
  }
}

testQuery();
