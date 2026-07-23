import pool from '../config/db.js';
import { promocionModel } from '../models/promocion.model.js';
import { sendPromotionEmailToClients } from '../services/nodemailer.service.js';
import { customer } from '../models/customer.model.js';
import cloudinary from 'cloudinary';

cloudinary.v2.config({
  cloud_name: 'di1xs8vma',
  api_key: '988922896642611',
  api_secret: 'kXxV0xd010GemNIuNVaIF8gAIP0'
});
export const getPromociones = async (req, res) => {
  try {
    const result = await pool.query(promocionModel.getAll);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createPromocion = async (req, res) => {
  try {
    const { nombre, descripcion, precio, img_url, cabanas_ids, fecha_inicio, fecha_fin, dias_estadia } = req.body;

    const p_precio = precio === "" ? null : precio;
    const p_dias_estadia = dias_estadia ? parseInt(dias_estadia, 10) : null;

    await pool.query("BEGIN");

    let final_img_url = img_url;
    if (img_url && img_url.startsWith('data:image')) {
      const uploadRes = await cloudinary.v2.uploader.upload(img_url, { folder: "promociones" });
      final_img_url = uploadRes.secure_url;
    }

    const result = await pool.query(promocionModel.create, [
      nombre, descripcion, p_precio, final_img_url, fecha_inicio || null, fecha_fin || null, p_dias_estadia
    ]);
    const promocionId = result.rows[0].promocion_id;

    if (cabanas_ids && cabanas_ids.length > 0) {
      for (const cabana_id of cabanas_ids) {
        await pool.query(promocionModel.addCabanas, [promocionId, cabana_id]);
      }
    }

    await pool.query("COMMIT");

    // Enviar notificación por correo a clientes registrados (asíncrono para no bloquear la respuesta)
    try {
      const resultEmails = await pool.query(customer.getAllEmails);
      const emails = resultEmails.rows.map(r => r.email).filter(e => e);
      
      if (emails.length > 0) {
        sendPromotionEmailToClients(emails, {
          id: promocionId,
          nombre,
          descripcion,
          precio: p_precio || 0,
          img_url
        }).catch(err => console.error("Error enviando correos asíncronamente:", err));
      }
    } catch (err) {
      console.error("Error en el bloque de notificación automática:", err);
    }

    res.json({ message: "Promoción creada", id: promocionId });
  } catch (error) {
    await pool.query("ROLLBACK");
    res.status(500).json({ message: error.message });
  }
};

export const updatePromocion = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, precio, img_url, cabanas_ids, fecha_inicio, fecha_fin, dias_estadia } = req.body;

    const p_precio = precio === "" ? null : precio;
    const p_dias_estadia = dias_estadia ? parseInt(dias_estadia, 10) : null;

    await pool.query("BEGIN");

    let final_img_url = img_url;
    if (img_url && img_url.startsWith('data:image')) {
      const uploadRes = await cloudinary.v2.uploader.upload(img_url, { folder: "promociones" });
      final_img_url = uploadRes.secure_url;
    }

    await pool.query(promocionModel.update, [
      nombre, descripcion, p_precio, final_img_url, fecha_inicio || null, fecha_fin || null, p_dias_estadia, id
    ]);

    // Clear old cabanas
    await pool.query(promocionModel.clearCabanas, [id]);

    // Add new ones
    if (cabanas_ids && cabanas_ids.length > 0) {
      for (const cabana_id of cabanas_ids) {
        await pool.query(promocionModel.addCabanas, [id, cabana_id]);
      }
    }

    await pool.query("COMMIT");
    res.json({ message: "Promoción actualizada" });
  } catch (error) {
    await pool.query("ROLLBACK");
    res.status(500).json({ message: error.message });
  }
};

export const deletePromocion = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("BEGIN");
    await pool.query(promocionModel.clearCabanas, [id]);
    await pool.query(promocionModel.delete, [id]);
    await pool.query("COMMIT");
    res.json({ message: "Promoción eliminada permanentemente" });
  } catch (error) {
    await pool.query("ROLLBACK");
    res.status(500).json({ message: error.message });
  }
};

export const activatePromocion = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(promocionModel.activate, [id]);
    res.json({ message: "Promoción activada" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deactivatePromocion = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(promocionModel.deactivate, [id]);
    res.json({ message: "Promoción desactivada" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
