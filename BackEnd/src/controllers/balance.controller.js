import pool from '../config/db.js';
import { sendAdminNotificationEmail } from '../services/nodemailer.service.js';

export const getBalanceDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const resData = await pool.query(`
            SELECT r.reserva_id, c.nombre as cliente, c.email, r.por_pagar, r.estado, p.nombre as paquete, cb.nombre as cabana, r.llegada, r.salida
            FROM reservas r
            JOIN clientes c ON r.cliente_id = c.cliente_id
            JOIN paquetes p ON r.paquete_id = p.paquete_id
            JOIN cabanas cb ON p.cabana_id = cb.cabana_id
            WHERE r.reserva_id = $1
        `, [id]);
        
        if (resData.rows.length === 0) return res.status(404).json({ message: "Reserva no encontrada" });
        
        const accounts = await pool.query("SELECT * FROM cuentas_bancarias WHERE activa = true");
        
        res.json({
            reserva: resData.rows[0],
            cuentas: accounts.rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

export const uploadBalanceReceipt = async (req, res) => {
    try {
        const { id } = req.params;
        const fileUrl = req.file ? (req.file.path || req.file.secure_url || req.file.url) : null;
        
        if (!fileUrl) return res.status(400).json({ message: "No se proporcionó un comprobante" });
        
        await pool.query(
            "UPDATE reservas SET comprobante_saldo_url = $1, estado_saldo = 'En revisión' WHERE reserva_id = $2",
            [fileUrl, id]
        );
        
        const resData = await pool.query(`
            SELECT c.nombre, c.contacto, r.llegada, r.salida, r.por_pagar 
            FROM reservas r JOIN clientes c ON r.cliente_id = c.cliente_id WHERE r.reserva_id = $1
        `, [id]);
        
        if (resData.rows.length > 0) {
            const data = resData.rows[0];
            sendAdminNotificationEmail(data.nombre, data.llegada, data.salida, 0, 0, 0).catch(console.error);
        }
        
        res.json({ message: "Comprobante subido exitosamente", url: fileUrl });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

export const getPendingBalances = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT * FROM vista_reservas 
            WHERE comprobante_saldo_url IS NOT NULL 
              AND estado_saldo = 'En revisión'
            ORDER BY fecha DESC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

export const approveBalance = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("BEGIN");
        
        const resData = await pool.query("SELECT por_pagar FROM reservas WHERE reserva_id = $1", [id]);
        if (resData.rows.length === 0) throw new Error("Reserva no encontrada");
        
        const amountPaid = resData.rows[0].por_pagar;
        
        await pool.query(
            "UPDATE reservas SET por_pagar = 0, estado_saldo = 'Aprobado' WHERE reserva_id = $1",
            [id]
        );
        
        const factRes = await pool.query("SELECT factura_id FROM facturas WHERE reserva_id = $1", [id]);
        if (factRes.rows.length > 0) {
            const factura_id = factRes.rows[0].factura_id;
            await pool.query("UPDATE facturas SET total_restante = 0 WHERE factura_id = $1", [factura_id]);
            
            const methodRes = await pool.query("SELECT metodo_id FROM metodos_pago ORDER BY metodo_id ASC LIMIT 1");
            const metodo_id = methodRes.rows.length > 0 ? methodRes.rows[0].metodo_id : 1;
            
            await pool.query(
                "INSERT INTO pagos (factura_id, fecha_pago, metodo_id, estado, total_pagado) VALUES ($1, CURRENT_DATE, $2, 'Completado', $3)",
                [factura_id, metodo_id, amountPaid]
            );
        }
        
        await pool.query("COMMIT");
        res.json({ message: "Pago de saldo aprobado" });
    } catch (error) {
        await pool.query("ROLLBACK");
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

export const rejectBalance = async (req, res) => {
    try {
        const { id } = req.params;
        
        await pool.query(
            "UPDATE reservas SET comprobante_saldo_url = NULL, estado_saldo = 'Rechazado' WHERE reserva_id = $1",
            [id]
        );
        
        res.json({ message: "Pago de saldo rechazado" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};
