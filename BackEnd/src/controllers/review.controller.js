import { review } from "../models/review.model.js";
import pool from "../config/db.js";

export const getReviews = async (req, res) => {
  try {
    const result = await pool.query(review.getReviews);
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createReview = async (req, res) => {
  try {
    const { nombre, texto, rating } = req.body;
    
    if (!nombre || !texto || !rating) {
      return res.status(400).json({ success: false, message: "Todos los campos son obligatorios" });
    }

    const result = await pool.query(review.createReview, [nombre, texto, rating]);
    
    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
