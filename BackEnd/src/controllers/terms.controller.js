import pool from "../config/db.js";
import { termsModel } from "../models/terms.model.js";

export const getTerms = async (req, res) => {
  try {
    const result = await pool.query(termsModel.getTerms);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTermById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(termsModel.getTermById, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Término no encontrado." });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createTerm = async (req, res) => {
  try {
    const { titulo, contenido, categoria, orden } = req.body;
    if (!titulo || !contenido) {
      return res.status(400).json({ message: "El título y contenido son obligatorios." });
    }
    const result = await pool.query(termsModel.createTerm, [
      titulo,
      contenido,
      categoria || 'General',
      orden || 1
    ]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTerm = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, contenido, categoria, orden } = req.body;

    const result = await pool.query(termsModel.updateTerm, [
      titulo,
      contenido,
      categoria,
      orden,
      id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Término no encontrado." });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteTerm = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(termsModel.deleteTerm, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Término no encontrado." });
    }
    res.json({ message: "Término eliminado exitosamente.", term: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
