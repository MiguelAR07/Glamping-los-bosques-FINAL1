require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function testAll() {
  console.log('--- PROBANDO CONSULTAS DE BACKEND ---');

  try {
    const resReservas = await pool.query('SELECT * FROM vista_reservas');
    console.log('✅ vista_reservas OK. Cantidad:', resReservas.rows.length);
  } catch (e) {
    console.error('❌ ERROR vista_reservas:', e.message);
  }

  try {
    const resInvoices = await pool.query('SELECT * FROM vista_facturas');
    console.log('✅ vista_facturas OK. Cantidad:', resInvoices.rows.length);
  } catch (e) {
    console.error('❌ ERROR vista_facturas:', e.message);
  }

  try {
    const resPaquetes = await pool.query('SELECT * FROM vista_paquetes');
    console.log('✅ vista_paquetes OK. Cantidad:', resPaquetes.rows.length);
  } catch (e) {
    console.error('❌ ERROR vista_paquetes:', e.message);
  }

  try {
    const resCabanas = await pool.query('SELECT * FROM cabanas');
    console.log('✅ cabanas OK. Cantidad:', resCabanas.rows.length);
  } catch (e) {
    console.error('❌ ERROR cabanas:', e.message);
  }

  try {
    const resServicios = await pool.query('SELECT * FROM vista_servicios');
    console.log('✅ vista_servicios OK. Cantidad:', resServicios.rows.length);
  } catch (e) {
    console.error('❌ ERROR vista_servicios:', e.message);
  }

  pool.end();
}

testAll();
