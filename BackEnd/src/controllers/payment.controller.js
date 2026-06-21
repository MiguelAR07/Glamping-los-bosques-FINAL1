import { payment, paymentFilters, paymentStats } from "../models/payments.model.js";
import pool from "../config/db.js";
import { updateReservationByPayment } from "../models/reservation.model.js";


export const getPayments = async (req, res) => {
  try {
    const result = await pool.query(payment.getPayments);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export const getPaymentByInvoice = async (req, res) => {
  try {
    const { name } = req.body;

    const result = await pool.query(payment.getPaymentByInvoice, [name.trim()]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export const createPaymentManually = async (req, res) => {
  try {
    const { factura_id, email, metodo_id, total_pagado } = req.body;

    await pool.query('BEGIN');

    const result = await pool.query(
      payment.createPaymentManually,
      [factura_id, metodo_id, 'Agregado Manual', total_pagado, email]
    )

    if (result.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ message: "No se pudo procesar: Datos inválidos o no coinciden." });
    }

    const reserva_id = result.rows[0].reserva_id;

    await pool.query(
      updateReservationByPayment.updateTotal,
      [factura_id, reserva_id]
    );

    await pool.query(
      updateReservationByPayment.updateStatus
    );

    await pool.query('COMMIT');

    res.json(result.rows[0]);
  } catch (error) {
    await pool.query('ROLLBACK');
    res.status(500).json({ message: error.message });
  }
}

export const PaymentFilters = async (req, res) => {
  try {
    const [recent_payments, sucefull_payments] = await Promise.all([
      pool.query(paymentFilters.getRecentPayments),
      pool.query(paymentFilters.getSucefullyPayments),
    ]);
    res.json({
      recent_payments: recent_payments.rows,
      sucefull_payments: sucefull_payments.rows,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export const getPaymentStats = async (req, res) => {
  try {
    const [successful_payments, rejected_payments, pending_refunds, revenue, revenue_graph, revenue_by_cabin, payments_by_method] = await Promise.all([
      pool.query(paymentStats.getSuccessfulPayments),
      pool.query(paymentStats.getRejectedPayments),
      pool.query(paymentStats.getPendingRefunds),
      pool.query(paymentStats.getRevenue),
      pool.query(paymentStats.getRevenueGraph),
      pool.query(paymentStats.getRevenueByCabin),
      pool.query(paymentStats.getPaymentsByMethod),
    ]);
    res.json({
      successful_payments: successful_payments.rows,
      rejected_payments: rejected_payments.rows,
      pending_refunds: pending_refunds.rows,
      revenue: revenue.rows,
      revenue_graph: revenue_graph.rows,
      revenue_by_cabin: revenue_by_cabin.rows,
      payments_by_method: payments_by_method.rows,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}