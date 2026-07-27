import pool from '../config/db.js';
import { sendAdminNotificationEmail, sendBalanceAdminNotificationEmail, sendReservationConfirmedEmail } from '../services/nodemailer.service.js';
import { sendBalanceApprovedWhatsApp } from '../services/whatsapp.service.js';

export const getBalanceDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const resData = await pool.query(`
            SELECT r.reserva_id, c.nombre as cliente, c.email, r.por_pagar, r.estado, r.comprobante_saldo_url, r.estado_saldo, p.nombre as paquete, cb.nombre as cabana, r.llegada, r.salida
            FROM reservas r
            JOIN clientes c ON r.cliente_id = c.cliente_id
            JOIN paquetes p ON r.paquete_id = p.paquete_id
            JOIN cabanas cb ON p.cabana_id = cb.cabana_id
            WHERE r.reserva_id = $1
        `, [id]);
        
        if (resData.rows.length === 0) return res.status(404).json({ message: "Reserva no encontrada" });
        
        const accounts = await pool.query("SELECT * FROM cuentas_bancarias WHERE estado = true");
        
        const reserva = resData.rows[0];
        const alreadySubmitted = Boolean(reserva.comprobante_saldo_url || Number(reserva.por_pagar) <= 0 || reserva.estado_saldo === 'En revisión' || reserva.estado_saldo === 'Aprobado');

        res.json({
            reserva: {
                ...reserva,
                alreadySubmitted
            },
            cuentas: accounts.rows,
            metodosPago: accounts.rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

export const uploadBalanceReceipt = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if receipt already uploaded or paid
        const checkRes = await pool.query("SELECT comprobante_saldo_url, por_pagar, estado_saldo FROM reservas WHERE reserva_id = $1", [id]);
        if (checkRes.rows.length > 0) {
            const r = checkRes.rows[0];
            if (r.comprobante_saldo_url || Number(r.por_pagar) <= 0 || r.estado_saldo === 'En revisión' || r.estado_saldo === 'Aprobado') {
                return res.status(400).json({ message: "Ya has subido tu comprobante para este saldo o la reserva ya fue saldada." });
            }
        }

        const fileUrl = req.file ? (req.file.path || req.file.secure_url || req.file.url) : null;
        
        if (!fileUrl) return res.status(400).json({ message: "No se proporcionó un comprobante" });
        
        await pool.query(
            "UPDATE reservas SET comprobante_saldo_url = $1, estado_saldo = 'En revisión' WHERE reserva_id = $2",
            [fileUrl, id]
        );
        
        const resData = await pool.query(`
            SELECT c.nombre, c.contacto, c.email, r.llegada, r.salida, r.por_pagar, f.factura_id,
                   cb.nombre as cabana_nombre, tp.nombre as tipo_plan, p.nombre as paquete_nombre,
                   f.subtotal, f.descuento, (SELECT total_pagado FROM pagos WHERE factura_id = f.factura_id LIMIT 1) as amountPaid,
                   r.adultos, r.ninos, r.mascotas, vr."Servicios adicionales", vr."Cédula"
            FROM reservas r 
            JOIN clientes c ON r.cliente_id = c.cliente_id 
            LEFT JOIN facturas f ON r.reserva_id = f.reserva_id
            JOIN paquetes p ON r.paquete_id = p.paquete_id
            JOIN cabanas cb ON p.cabana_id = cb.cabana_id
            JOIN tipo_paquete tp ON p.tipo_id = tp.tipo_id
            LEFT JOIN vista_reservas vr ON r.reserva_id = vr.id
            WHERE r.reserva_id = $1
        `, [id]);
        
        if (resData.rows.length > 0) {
            const data = resData.rows[0];
            const formatDate = (d) => new Date(d).toLocaleDateString('es-CO');
            const invoiceData = {
                reservaId: id,
                facturaId: data.factura_id,
                clienteNombre: data.nombre,
                documento: data["Cédula"] || 'No registrado',
                cabana: data.cabana_nombre,
                plan: `${data.tipo_plan} - ${data.paquete_nombre}`,
                llegada: formatDate(data.llegada),
                salida: formatDate(data.salida),
                huespedes: data["Servicios adicionales"] || 'A confirmar',
                total: (Number(data.subtotal) || 0) - (Number(data.descuento) || 0),
                pagoRestante: Number(data.por_pagar),
                amountPaid: Number(data.amountpaid) || 0,
                adultos: data.adultos,
                ninos: data.ninos,
                mascotas: data.mascotas
            };
            sendBalanceAdminNotificationEmail(invoiceData).catch(console.error);
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
            WHERE "Pago restante" > 0 OR estado_saldo IS NOT NULL
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
        
        const resData = await pool.query(`
            SELECT r.por_pagar, c.nombre, c.contacto, c.email, r.llegada, r.salida, f.factura_id,
                   cb.nombre as cabana_nombre, tp.nombre as tipo_plan, p.nombre as paquete_nombre,
                   f.subtotal, f.descuento, (SELECT total_pagado FROM pagos WHERE factura_id = f.factura_id LIMIT 1) as amountPaid,
                   r.adultos, r.ninos, r.mascotas, vr."Servicios adicionales", vr."Cédula"
            FROM reservas r 
            JOIN clientes c ON r.cliente_id = c.cliente_id 
            LEFT JOIN facturas f ON r.reserva_id = f.reserva_id
            JOIN paquetes p ON r.paquete_id = p.paquete_id
            JOIN cabanas cb ON p.cabana_id = cb.cabana_id
            JOIN tipo_paquete tp ON p.tipo_id = tp.tipo_id
            LEFT JOIN vista_reservas vr ON r.reserva_id = vr.id
            WHERE r.reserva_id = $1
        `, [id]);
        if (resData.rows.length === 0) throw new Error("Reserva no encontrada");
        
        const data = resData.rows[0];
        const amountPaid = data.por_pagar;
        const clienteNombre = data.nombre;
        const clienteContacto = data.contacto;
        const clienteEmail = data.email;
        
        await pool.query(
            "UPDATE reservas SET por_pagar = 0, estado_saldo = 'Aprobado' WHERE reserva_id = $1",
            [id]
        );
        
        if (data.factura_id) {
            await pool.query("UPDATE facturas SET total_restante = 0 WHERE factura_id = $1", [data.factura_id]);
            
            const methodRes = await pool.query("SELECT metodo_id FROM metodos_pago ORDER BY metodo_id ASC LIMIT 1");
            const metodo_id = methodRes.rows.length > 0 ? methodRes.rows[0].metodo_id : 1;
            
            await pool.query(
                "INSERT INTO pagos (factura_id, fecha_pago, metodo_id, estado, total_pagado) VALUES ($1, CURRENT_DATE, $2, 'Completado', $3)",
                [data.factura_id, metodo_id, amountPaid]
            );
        }
        
        await pool.query("COMMIT");
        
        // Enviar WhatsApp en segundo plano
        sendBalanceApprovedWhatsApp(clienteContacto, clienteNombre).catch(console.error);

        // Enviar Email de factura final al cliente con saldo en 0
        if (clienteEmail) {
            const formatDate = (d) => new Date(d).toLocaleDateString('es-CO');
            const newAmountPaid = (Number(data.amountpaid) || 0) + Number(amountPaid);
            const invoiceData = {
                reservaId: id,
                facturaId: data.factura_id,
                clienteNombre: data.nombre,
                documento: data["Cédula"] || 'No registrado',
                cabana: data.cabana_nombre,
                plan: `${data.tipo_plan} - ${data.paquete_nombre}`,
                llegada: formatDate(data.llegada),
                salida: formatDate(data.salida),
                huespedes: data["Servicios adicionales"] || 'A confirmar',
                total: (Number(data.subtotal) || 0) - (Number(data.descuento) || 0),
                pagoRestante: 0, // El saldo ya fue aprobado
                amountPaid: newAmountPaid,
                adultos: data.adultos,
                ninos: data.ninos,
                mascotas: data.mascotas
            };
            sendReservationConfirmedEmail(clienteEmail, invoiceData).catch(console.error);
        }
        
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
