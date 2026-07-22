import dotenv from 'dotenv';
import pg from 'pg';
dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function test() {
  try {
    await pool.query("BEGIN");
    
    // We need a valid paquete_id and cliente_id for the foreign key
    const llegada = '2026-08-06T15:00:00.000Z';
    const salida = '2026-08-06T22:00:00.000Z';
    
    console.log("Testing real insert...");
    
    // Let's first create a test client and package
    const c = await pool.query("INSERT INTO clientes (nombre, email, contacto, tipo_identificacion, numero_identificacion, pais_residencia) VALUES ('Test', 'test@test.com', '123', 'C.C.', '123', 'CO') RETURNING cliente_id");
    const cid = c.rows[0].cliente_id;
    
    const p = await pool.query("INSERT INTO paquetes (nombre, cabana_id, dias_estadia, descripcion, tipo_id) VALUES ('Test package', 1, 1, 'test', 4) RETURNING paquete_id");
    const pid = p.rows[0].paquete_id;

    // Now insert reservation using the EXACT query format
    const reservationResult = await pool.query(`
      INSERT INTO reservas (paquete_id, cliente_id, fecha_registro, llegada, salida, estado, por_pagar, factura_url)
      SELECT
          p.paquete_id,
          c.cliente_id,
          CURRENT_TIMESTAMP,
          $1, 
          $2, 
          'Por validar',
          $5, 
          $6  
      FROM paquetes p, clientes c
      WHERE p.paquete_id = $4 AND c.cliente_id = $3
      RETURNING reserva_id;
    `, [llegada, salida, cid, pid, 50000, null]);
    
    console.log("Create Reservation Passed! Rows:", reservationResult.rowCount);
    
    await pool.query("ROLLBACK");
  } catch(e) {
    await pool.query("ROLLBACK");
    console.error("ERROR:", e.message);
  } finally {
    process.exit(0);
  }
}

test();
