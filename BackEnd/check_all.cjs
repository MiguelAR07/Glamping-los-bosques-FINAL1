require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function check() {
  const tables = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE'");
  console.log('BASE TABLES:', tables.rows.map(r => r.table_name));

  const totalPagos = await pool.query("SELECT SUM(total_pagado) FROM pagos");
  console.log('SUM TOTAL_PAGADO IN PAGOS:', totalPagos.rows[0]);

  const totalFacturas = await pool.query("SELECT SUM(subtotal), SUM(total) FROM facturas");
  console.log('SUM FACTURAS:', totalFacturas.rows[0]);

  const reservas = await pool.query("SELECT reserva_id, por_pagar, estado FROM reservas");
  console.log('RESERVAS SUMMARY:', reservas.rows);

  pool.end();
}

check().catch(console.error);
