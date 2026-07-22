import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function testDelete() {
  try {
    await pool.query("BEGIN");
    console.log('Testing delete on reembolsos...');
    await pool.query(
      "DELETE FROM reembolsos WHERE factura_id IN (SELECT factura_id FROM facturas WHERE reserva_id IN (SELECT reserva_id FROM reservas WHERE estado IN ('Cancelado', 'Cancelada')))"
    );
    console.log('Testing delete on pagos...');
    await pool.query(
      "DELETE FROM pagos WHERE factura_id IN (SELECT factura_id FROM facturas WHERE reserva_id IN (SELECT reserva_id FROM reservas WHERE estado IN ('Cancelado', 'Cancelada')))"
    );
    console.log('Testing delete on facturas...');
    await pool.query("DELETE FROM facturas WHERE reserva_id IN (SELECT reserva_id FROM reservas WHERE estado IN ('Cancelado', 'Cancelada'))");
    console.log('Testing delete on reservas...');
    const result = await pool.query("DELETE FROM reservas WHERE estado IN ('Cancelado', 'Cancelada') RETURNING reserva_id");
    console.log('Deleted rows:', result.rows);
    await pool.query("ROLLBACK"); // We rollback since we are just testing
    console.log('Test successful');
  } catch (error) {
    await pool.query("ROLLBACK");
    console.error('Error:', error.message, error);
  } finally {
    pool.end();
  }
}
testDelete();
