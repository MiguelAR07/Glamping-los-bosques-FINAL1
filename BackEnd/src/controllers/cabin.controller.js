import { cabin, cabinStats, cabinFilters } from "../models/cabin.model.js";
import pool from "../config/db.js";
import { notification } from "../models/notification.model.js";

export const getCabinFilters = async (req, res) => {
  try {
    const inactiveCabins = await pool.query(cabinFilters.inactiveCabins);
    res.json({
      inactiveCabins: inactiveCabins.rows
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCabins = async (req, res) => {
  try {
    const cabins = await pool.query(cabin.getCabins);
    res.json(cabins.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export const getCabinByName = async (req, res) => {
  try {
    const { name } = req.body;

    const result = await pool.query(
      cabin.getCabinByName,
      [name]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export const getCabinImages = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      cabin.getCabinImgs,
      [id]
    );

    res.json(result.rows);
  } catch(error) {
    res.status(500).json({ message: error.message });
  }
}

export const createCabin = async (req, res) => {
  try {
    const { nombre, precio_noche, capacidad_personas, descripcion, userName } = req.body;

    await pool.query("BEGIN");

    const result = await pool.query(
      cabin.createCabin, 
      [nombre, precio_noche, capacidad_personas, descripcion]
    );

    await pool.query(notification.createNotification, [
      userName,
      "Cabaña",
      `La cabaña ${nombre} ha sido creada`
    ]);

    await pool.query("COMMIT");

    res.json(result.rows[0]);
  } catch (error) {
    await pool.query("ROLLBACK");
    res.status(500).json({ message: error.message });
  }
}

export const updateCabin = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, precio_noche, capacidad_personas, descripcion, userName } = req.body;

    await pool.query("BEGIN");

    const result = await pool.query(
      cabin.updateCabin,
      [nombre, precio_noche, capacidad_personas, descripcion, id]
    );

    await pool.query(notification.createNotification, [
      userName,
      "Cabaña",
      `La cabaña #${id} - ${nombre} ha sido actualizada`
    ]);

    await pool.query("COMMIT");

    res.json(result.rows[0]);
  } catch (error) {
    await pool.query("ROLLBACK");
    res.status(500).json({ message: error.message });
  }
}

export const deleteCabin = async (req, res) => {
  try {
    const { id } = req.params;
    const userName = req.body.userName;

    await pool.query("BEGIN");

    const result = await pool.query(
      cabin.deleteCabin,
      [id]
    );

    await pool.query(notification.createNotification, [
      userName,
      "Cabaña",
      `La cabaña #${id} ha sido eliminada`
    ]);

    await pool.query("COMMIT");

    res.json(result.rows[0]);
  } catch (error) {
    await pool.query("ROLLBACK");
    res.status(500).json({ message: error.message });
  }
}

export const activateCabin = async (req, res) => {
  try {
    const { id } = req.params;
    const userName = req.body.userName;

    await pool.query("BEGIN");

    const result = await pool.query(
      cabin.activateCabin,
      [id]
    );

    await pool.query(notification.createNotification, [
      userName,
      "Cabaña",
      `La cabaña #${id} ha sido activada`
    ])

    await pool.query("COMMIT");
  
    res.json(result.rows[0]);
  } catch (error) {
    await pool.query("ROLLBACK");
    res.status(500).json({error: error.message})
  }
};

export const getCabinStats = async (req, res) => {
  try {
    const [stats, total, graph] = await Promise.all([
      pool.query(cabinStats.get_stats),
      pool.query(cabinStats.total_cabins),
      pool.query(cabinStats.get_graph_revenue),
    ]);

    res.json({
      most_reserved: stats.rows[0] || null,
      total_cabins: total.rows[0] || null,
      revenue_graph: graph.rows,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};