import pool from '../config/db.js';

export const getComprobantes = async (req, res) => {
  try {
    const query = `
      SELECT 
        r.id_reserva AS id,
        c.nombre AS "Cliente",
        cab.nombre AS "Cabaña",
        r.estado AS "Estado",
        r.fecha_llegada AS "Llegada",
        r.factura_url AS "comprobante"
      FROM reservas r
      JOIN clientes c ON r.id_cliente = c.id_cliente
      JOIN cabanas cab ON r.id_cabana = cab.id_cabana
      WHERE r.factura_url IS NOT NULL AND r.factura_url != ''
      ORDER BY r.fecha_reserva DESC
    `;
    const { rows } = await pool.query(query);

    if (rows.length === 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(rows);
  } catch (error) {
    console.error("Error al obtener comprobantes:", error);
    res.status(500).json({ success: false, message: "Error interno del servidor", error: error.message });
  }
};
