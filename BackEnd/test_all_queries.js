import dotenv from 'dotenv';
import pg from 'pg';
dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function testAll() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    
    console.log("1. createCustomer");
    const customerResult = await client.query(`
        INSERT INTO clientes (nombre, email, contacto, numero_identificacion, pais_residencia, tipo_identificacion)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
    `, ["Test", "test@test.com", "1234567", "1234567", "CO", "C.C."]);

    console.log("4. createPackage");
    const packageResult = await client.query(`
        INSERT INTO paquetes (cabana_id, dias_estadia, fecha_registro, descripcion, estado, tipo_id, nombre)
        VALUES ($1, $2, CURRENT_DATE, $3, 'Activo', $4, $5)
        RETURNING *
    `, [1, 0, "Desc", 4, "Nombre"]);

    console.log("6. createReservation");
    const reservationResult = await client.query(`
        INSERT INTO reservas (paquete_id, cliente_id, fecha_registro, llegada, salida, estado, por_pagar, factura_url)
        SELECT
            p.paquete_id,
            c.cliente_id,
            CURRENT_TIMESTAMP,
            $1, -- llegada
            $2, -- salida
            'Por validar',
            $5, -- por_pagar
            $6  -- factura_url, comprobante de pago
        FROM paquetes p, clientes c
        WHERE c.cliente_id = $3
          AND p.paquete_id = $4
          AND p.estado = 'Activo'
        RETURNING *;
    `, [
        '2026-08-06T15:00:00.000Z',
        '2026-08-06T23:00:00.000Z',
        customerResult.rows[0].cliente_id,
        packageResult.rows[0].paquete_id,
        50000,
        null
    ]);

    console.log("RESERVATION RESULT:");
    console.log(reservationResult.rows[0]);

    console.log("7. createInvoice");
    await client.query(`
        INSERT INTO facturas (reserva_id, fecha_factura, subtotal, descuento)
        SELECT
            r.reserva_id,
            CURRENT_DATE,
            $1,
            $2
        FROM reservas r
        WHERE r.reserva_id = $3
            AND r.estado IN ('Activo', 'Por validar', 'Confirmado')
        RETURNING *;
    `, [50000, 0, reservationResult.rows[0].reserva_id]);

    await client.query("ROLLBACK");
    console.log("ALL SUCCESS!");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("ERROR:", err.message);
  } finally {
    client.release();
    process.exit(0);
  }
}

testAll();
