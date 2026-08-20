require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const { reservationDashboardStats, reservationStats } = require('./src/models/reservation.model.js');
const { paymentStats } = require('./src/models/payments.model.js');
const { cabinStats } = require('./src/models/cabin.model.js');

async function testAllStats() {
  console.log("=== DASHBOARD STATS NOW ===");
  const totalReservations = await pool.query(reservationDashboardStats.totalReservations);
  const mostPopularPackage = await pool.query(reservationDashboardStats.mostPopularPackage);
  const mostPopularDay = await pool.query(reservationDashboardStats.mostPopularDay);
  const getRevenueByMonth = await pool.query(reservationDashboardStats.getRevenueByMonth);

  console.log({
    totalReservations: totalReservations.rows,
    mostPopularPackage: mostPopularPackage.rows,
    mostPopularDay: mostPopularDay.rows,
    getRevenueByMonth: getRevenueByMonth.rows,
  });

  console.log("=== RESERVATION STATS NOW ===");
  const resMonth = await pool.query(reservationStats.revenueMonth);
  const resConf = await pool.query(reservationStats.totalConfirmed);
  const resCabin = await pool.query(reservationStats.revenueByCabin);

  console.log({
    revenueMonth: resMonth.rows,
    totalConfirmed: resConf.rows,
    revenueByCabin: resCabin.rows,
  });

  console.log("=== PAYMENT STATS NOW ===");
  const payRevenue = await pool.query(paymentStats.getRevenue);
  const paySucc = await pool.query(paymentStats.getSuccessfulPayments);
  console.log({
    revenue: payRevenue.rows,
    successful_payments: paySucc.rows
  });

  pool.end();
}

testAllStats().catch(console.error);
