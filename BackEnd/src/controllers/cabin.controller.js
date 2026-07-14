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

  export const getAllCabinImages = async (req, res) => {
    try {
      const result = await pool.query(cabin.getAllCabinImgs);
      res.json(result.rows);
    } catch(error) {
      res.status(500).json({ message: error.message });
    }
  }

  export const updateImagesOrder = async (req, res) => {
    const { images } = req.body;
    
    if (!images || !Array.isArray(images)) {
      return res.status(400).json({ message: "Formato de imágenes inválido" });
    }
    
    try {
      await pool.query("BEGIN");
      
      for (let i = 0; i < images.length; i++) {
        const { id, order } = images[i];
        if (id && order !== undefined) {
          await pool.query(cabin.updateImageOrder, [order, id]);
        }
      }
      
      await pool.query("COMMIT");
      res.json({ message: "Orden actualizado exitosamente" });
    } catch (error) {
      await pool.query("ROLLBACK");
      res.status(500).json({ message: error.message });
    }
  };


  export const uploadCabinImage = async (req, res) => {
    try {
      const { id } = req.params;
      
      if (!req.file) {
        return res.status(400).json({ message: "No se subió ninguna imagen" });
      }

      const img_url = req.file.path; // Cloudinary URL

      await pool.query("BEGIN");
      const result = await pool.query(cabin.insertCabinImg, [id, img_url]);
      await pool.query("COMMIT");

      res.status(201).json(result.rows[0]);
    } catch (error) {
      await pool.query("ROLLBACK");
      res.status(500).json({ message: error.message });
    }
  };

  export const deleteCabinImage = async (req, res) => {
    try {
      const { imageId } = req.params;

      await pool.query("BEGIN");
      const result = await pool.query(cabin.deleteCabinImg, [imageId]);
      await pool.query("COMMIT");

      if (result.rowCount === 0) {
        return res.status(404).json({ message: "Imagen no encontrada" });
      }

      res.json({ message: "Imagen eliminada exitosamente", deleted: result.rows[0] });
    } catch (error) {
      await pool.query("ROLLBACK");
      res.status(500).json({ message: error.message });
    }
  };

  export const createCabin = async (req, res) => {
    try {
      const { nombre, precio_noche, capacidad_personas, descripcion, userName, es_promocion, precio_promocional } = req.body;
      
      const p_noche = precio_noche === "" ? null : precio_noche;
      const c_personas = capacidad_personas === "" ? null : capacidad_personas;
      const p_promocional = precio_promocional === "" ? null : precio_promocional;
  
      if (p_noche !== null && Number(p_noche) < 0) throw new Error("El precio por noche no puede ser negativo");
      if (p_promocional !== null && Number(p_promocional) < 0) throw new Error("El precio promocional no puede ser negativo");
      if (c_personas !== null && Number(c_personas) < 0) throw new Error("La capacidad de personas no puede ser negativa");

      await pool.query("BEGIN");
  
      const result = await pool.query(
        cabin.createCabin, 
        [nombre, p_noche, c_personas, descripcion, es_promocion, p_promocional]
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
      const { nombre, precio_noche, capacidad_personas, descripcion, userName, es_promocion, precio_promocional } = req.body;
      
      const p_noche = precio_noche === "" ? null : precio_noche;
      const c_personas = capacidad_personas === "" ? null : capacidad_personas;
      const p_promocional = precio_promocional === "" ? null : precio_promocional;
  
      if (p_noche !== null && Number(p_noche) < 0) throw new Error("El precio por noche no puede ser negativo");
      if (p_promocional !== null && Number(p_promocional) < 0) throw new Error("El precio promocional no puede ser negativo");
      if (c_personas !== null && Number(c_personas) < 0) throw new Error("La capacidad de personas no puede ser negativa");

      await pool.query("BEGIN");
  
      const result = await pool.query(
        cabin.updateCabin,
        [nombre, p_noche, c_personas, descripcion, es_promocion, p_promocional, id]
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