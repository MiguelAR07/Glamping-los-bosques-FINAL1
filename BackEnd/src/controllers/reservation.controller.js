import { reservation, reservationFilters as reservationFiltersModel, reservationStats } from "../models/reservation.model.js";
import { invoice } from "../models/invoice.model.js";
import { refounds } from "../models/refound.model.js";
import { customer } from "../models/customer.model.js";
import { packages } from "../models/package.model.js";

import pool from "../config/db.js";

export const getreservations = async (req, res) => {
  try {
    const result = await pool.query(
      reservation.getReservations
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getReservationByInvoice = async (req, res) => {
  try {
    const { id } = req.body;

    const result = await pool.query(
      reservation.getReservationByInvoice,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Not found' });
    }

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const activateReservation = async (req, res) => {
  try {
    const { id } = req.params; // reserva_id

    await pool.query("BEGIN");

    // 1. Activar la reserva y obtener datos necesarios (como factura_id)
    // Asegúrate que tu consulta SQL devuelva la fila activada: RETURNING *
    const result = await pool.query(
      reservationModels.activateReservation,
      [id]
    );

    if (result.rows.length === 0) {
      await pool.query("ROLLBACK");
      return res.status(404).json({ message: 'La reserva no existe.' });
    }

    const factura_id = result.rows[0].factura_id;

    // 2. Anular el reembolso asociado a esa factura
    // Es "Cancelado" porque el dinero ya no se debe devolver, se queda en la empresa
    await pool.query(
      refounds.updateRefound,
      ["Cancelado", factura_id] 
    );

    await pool.query("COMMIT");
    res.json({ message: "Reserva reactivada y reembolso anulado", data: result.rows[0] });

  } catch (error) {
    await pool.query("ROLLBACK");
    res.status(500).json({ error: error.message });
  }
};

export const cancelReservation = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query("BEGIN");

    // Usamos la query directa porque vista_reservas tiene la reserva
    const resData = await pool.query("SELECT * FROM vista_reservas WHERE id = $1", [id]);
    const invData = await pool.query(invoice.getInvoiceByReservation, [id]);

    if (resData.rows.length === 0) {
      await pool.query("ROLLBACK");
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }

    const resRow = resData.rows[0];
    const invRow = invData.rows.length > 0 ? invData.rows[0] : null;

    // Cancelar la reserva usando el modelo original
    const result = await pool.query(reservation.cancelReservation, [id]);

    // Lógica de Reembolso: (Total - Deuda actual) = Lo que el cliente ya pagó
    let montoAPagar = 0;
    if (invRow) {
       montoAPagar = invRow.total - resRow["Pago restante"];
       
       if (montoAPagar > 0) {
         await pool.query(refounds.createRefound, [
           invRow.factura_id,
           "Reserva cancelada",
           montoAPagar
         ]);
       }
    }

    await pool.query("COMMIT");
    res.json({ message: "Cancelada con éxito", reembolso: montoAPagar });

  } catch (error) {
    await pool.query("ROLLBACK");
    console.error("Error en cancelReservation:", error);
    res.status(500).json({ error: error.message });
  }
};

export const hardDeleteReservation = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query("BEGIN");

    // Verificar que la reserva existe y está cancelada
    const check = await pool.query("SELECT reserva_id, estado FROM reservas WHERE reserva_id = $1", [id]);
    if (check.rows.length === 0) {
      await pool.query("ROLLBACK");
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }
    if (!['Cancelado', 'Cancelada'].includes(check.rows[0].estado)) {
      await pool.query("ROLLBACK");
      return res.status(400).json({ message: 'Solo se pueden eliminar reservas canceladas' });
    }

    // Eliminar reembolsos asociados a las facturas de esta reserva
    await pool.query(
      "DELETE FROM reembolsos WHERE factura_id IN (SELECT factura_id FROM facturas WHERE reserva_id = $1)", [id]
    );

    // Eliminar pagos asociados a las facturas de esta reserva
    await pool.query(
      "DELETE FROM pagos WHERE factura_id IN (SELECT factura_id FROM facturas WHERE reserva_id = $1)", [id]
    );

    // Eliminar facturas asociadas
    await pool.query("DELETE FROM facturas WHERE reserva_id = $1", [id]);

    // Eliminar la reserva
    const result = await pool.query(reservation.hardDeleteReservation, [id]);

    if (result.rows.length === 0) {
      await pool.query("ROLLBACK");
      return res.status(400).json({ message: 'No se pudo eliminar la reserva' });
    }

    await pool.query("COMMIT");
    res.json({ message: "Reserva eliminada definitivamente", reserva_id: id });

  } catch (error) {
    await pool.query("ROLLBACK");
    console.error("Error en hardDeleteReservation:", error);
    res.status(500).json({ error: error.message });
  }
};

export const hardDeleteAllCanceledReservations = async (req, res) => {
  try {
    await pool.query("BEGIN");

    // Encontrar todas las reservas canceladas
    const check = await pool.query("SELECT reserva_id FROM reservas WHERE estado IN ('Cancelado', 'Cancelada')");
    
    if (check.rows.length === 0) {
      await pool.query("ROLLBACK");
      return res.status(404).json({ message: 'No hay reservas canceladas para eliminar' });
    }

    // Eliminar reembolsos y pagos asociados a las facturas de reservas canceladas
    await pool.query(
      "DELETE FROM reembolsos WHERE factura_id IN (SELECT factura_id FROM facturas WHERE reserva_id IN (SELECT reserva_id FROM reservas WHERE estado IN ('Cancelado', 'Cancelada')))"
    );
    await pool.query(
      "DELETE FROM pagos WHERE factura_id IN (SELECT factura_id FROM facturas WHERE reserva_id IN (SELECT reserva_id FROM reservas WHERE estado IN ('Cancelado', 'Cancelada')))"
    );

    // Eliminar facturas de reservas canceladas
    await pool.query("DELETE FROM facturas WHERE reserva_id IN (SELECT reserva_id FROM reservas WHERE estado IN ('Cancelado', 'Cancelada'))");

    // Eliminar las reservas
    const result = await pool.query(reservation.hardDeleteAllCanceledReservations);

    await pool.query("COMMIT");
    res.json({ message: "Todas las reservas canceladas han sido eliminadas definitivamente", cantidad: result.rows.length });

  } catch (error) {
    await pool.query("ROLLBACK");
    console.error("Error en hardDeleteAllCanceledReservations:", error);
    res.status(500).json({ error: error.message });
  }
};

export const hardDeleteMultipleCanceledReservations = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'Se requiere un arreglo de IDs válidos' });
    }

    await pool.query("BEGIN");

    // Verificar cuáles de esos IDs son realmente reservas canceladas
    const check = await pool.query("SELECT reserva_id FROM reservas WHERE reserva_id = ANY($1::int[]) AND estado IN ('Cancelado', 'Cancelada')", [ids]);
    
    if (check.rows.length === 0) {
      await pool.query("ROLLBACK");
      return res.status(404).json({ message: 'No hay reservas canceladas seleccionadas para eliminar' });
    }

    const validIds = check.rows.map(r => r.reserva_id);

    // Eliminar reembolsos y pagos asociados
    await pool.query(
      "DELETE FROM reembolsos WHERE factura_id IN (SELECT factura_id FROM facturas WHERE reserva_id = ANY($1::int[]))", [validIds]
    );
    await pool.query(
      "DELETE FROM pagos WHERE factura_id IN (SELECT factura_id FROM facturas WHERE reserva_id = ANY($1::int[]))", [validIds]
    );

    // Eliminar facturas
    await pool.query("DELETE FROM facturas WHERE reserva_id = ANY($1::int[])", [validIds]);

    // Eliminar las reservas
    const result = await pool.query(reservation.hardDeleteMultipleCanceledReservations, [validIds]);

    await pool.query("COMMIT");
    res.json({ message: "Las reservas seleccionadas han sido eliminadas definitivamente", cantidad: result.rows.length });

  } catch (error) {
    await pool.query("ROLLBACK");
    console.error("Error en hardDeleteMultipleCanceledReservations:", error);
    res.status(500).json({ error: error.message });
  }
};

export const reservationFilters = async (req, res) => {
  try {
    const [incomingReservations, paidReservations, confirmedReservations, canceledReservations] = await Promise.all([
      pool.query(reservationFiltersModel.incomingReservations),
      pool.query(reservationFiltersModel.paidReservations),
      pool.query(reservationFiltersModel.confirmedReservations),
      pool.query(reservationFiltersModel.canceledReservations)
    ]);

    res.json({
      incomingReservations: incomingReservations.rows,
      paidReservations: paidReservations.rows,
      confirmedReservations: confirmedReservations.rows,
      canceledReservations: canceledReservations.rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
};

export const getReservationStats = async (req, res) => {
  try {
    const revenue_graph = await pool.query(reservationStats.getRevenueGraph);
    res.json({
      revenue_graph: revenue_graph.rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createReservation = async (req, res) => {
    try {
        let { cliente, reserva, factura, paquete } = req.body;
        if (typeof cliente === "string") cliente = JSON.parse(cliente);
        if (typeof reserva === "string") reserva = JSON.parse(reserva);
        if (typeof factura === "string") factura = JSON.parse(factura);
        if (typeof paquete === "string") paquete = JSON.parse(paquete);
        
        await pool.query("BEGIN");

        const customerResult = await pool.query(customer.createCustomer, [
            cliente.nombre,
            cliente.email,
            cliente.contacto,
            cliente.tipo_identificacion,
            cliente.numero_identificacion,
            cliente.pais_residencia
        ]);

        let nuevo_paquete_id;
        let cabana_id_check = null;

        if (paquete && Object.keys(paquete).length > 0) {
            cabana_id_check = paquete.cabana_id;
            const packageResult = await pool.query(packages.createPackage, [
                paquete.cabana_id,
                paquete.dias_estadia,
                paquete.descripcion,
                paquete.tipo_id
            ]);

            if (packageResult.rowCount === 0) throw new Error("No se pudo crear el paquete.");
            nuevo_paquete_id = packageResult.rows[0].paquete_id;
        } else if (reserva && reserva.paquete_id) {
            nuevo_paquete_id = reserva.paquete_id;
            const pkgInfo = await pool.query("SELECT cabana_id FROM paquetes WHERE paquete_id = $1", [nuevo_paquete_id]);
            if(pkgInfo.rows.length > 0) {
               cabana_id_check = pkgInfo.rows[0].cabana_id;
            }
        }

        // --- ESCUDO ANTI-CHOQUES ---
        if (cabana_id_check) {
            const overlapCheck = await pool.query(`
                SELECT r.reserva_id 
                FROM reservas r
                JOIN paquetes p ON r.paquete_id = p.paquete_id
                WHERE p.cabana_id = $1
                  AND r.estado NOT IN ('Cancelado', 'Cancelada')
                  AND (r.llegada < $3 AND r.salida > $2)
            `, [cabana_id_check, reserva.llegada, reserva.salida]);

            if (overlapCheck.rows.length > 0) {
                throw new Error("El horario seleccionado choca con una reserva existente en esta cabaña. Por favor, selecciona otro horario o cabaña.");
            }
        }
        // ---------------------------

        const nuevo_cliente_id = customerResult.rows[0].cliente_id;
        const facturaUrl = req.file ? req.file.path : null;

        const reservationResult = await pool.query(reservation.createReservation, [
            reserva.llegada,    // $1
            reserva.salida,     // $2
            nuevo_cliente_id,    // $3
            nuevo_paquete_id,    // $4
            reserva.por_pagar,   // $5
            facturaUrl          // $6
        ])

        if (reservationResult.rowCount === 0) throw new Error("El paquete seleccionado no existe o no está activo.");
        const nueva_reserva_id = reservationResult.rows[0].reserva_id;

        const invoiceResult = await pool.query(invoice.createInvoice, [
            factura.subtotal,        // $1
            factura.descuento || 0,  // $2
            null,                    // $3 (no usado pero lo paso para mantener orden)
            nueva_reserva_id,        // $4
            cliente.email            // $5
        ]);

        await pool.query("COMMIT");

        res.status(201).json({
            success: true,
            reserva_id: nueva_reserva_id,
            factura_id: invoiceResult.rows[0].factura_id,
            mensaje: "Reserva y factura generadas con éxito"
        });
    } catch (error) {
        await pool.query("ROLLBACK");
        res.status(500).json({ success: false, message: error.message });
    }
};

export const uploadPaymentReceipt = async (req, res) => {
    try {
        const { id } = req.params;
        if (!req.file) return res.status(400).json({ success: false, message: "Por favor, sube un comprobante." });

        const facturaUrl = req.file.path || req.file.secure_url || req.file.url;

        await pool.query("BEGIN");
        const result = await pool.query(reservation.updatePaymentReceipt, [facturaUrl, id]);
        if (result.rowCount === 0) throw new Error("La reserva especificada no existe.");
        await pool.query("COMMIT");

        res.status(200).json({ success: true, reserva: result.rows[0], mensaje: "Comprobante cargado con éxito" });
    } catch (error) {
        await pool.query("ROLLBACK");
        res.status(500).json({ success: false, message: error.message });
    }
};

import { sendReservationConfirmedEmail, sendReservationRejectedEmail, sendAdminNotificationEmail } from "../services/nodemailer.service.js";
import { sendReservationConfirmedSMS, sendReservationRejectedSMS } from "../services/sms.service.js";
import { sendReservationConfirmedWhatsApp, sendReservationRejectedWhatsApp, sendRescheduleWhatsApp } from "../services/whatsapp.service.js";

export const confirmReservationPayment = async (req, res) => {
    try {
        const { id } = req.params;

        await pool.query("BEGIN");

        // 1. Confirmar la reserva y extraer datos
        const result = await pool.query(reservation.confirmReservationAndGetDetails, [id]);

        if (result.rows.length === 0) {
            await pool.query("ROLLBACK");
            return res.status(404).json({ message: "La reserva no existe o ya no se puede confirmar." });
        }

        const data = result.rows[0];

        // Formatear las fechas para el correo
        const llegadaFormateada = new Date(data.llegada).toLocaleString('es-CO', { timeZone: 'America/Bogota', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true });
        const salidaFormateada = new Date(data.salida).toLocaleString('es-CO', { timeZone: 'America/Bogota', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true });

        // 2. Enviar correo electrónico de confirmación al cliente (En segundo plano)
        if (data.cliente_email) {
            sendReservationConfirmedEmail(
                data.cliente_email, 
                data.cliente_nombre, 
                llegadaFormateada, 
                salidaFormateada
            ).catch(err => console.error(err));
        }

        // 2.1 Enviar correo de notificación al administrador (En segundo plano)
        sendAdminNotificationEmail(data.cliente_nombre, llegadaFormateada, salidaFormateada).catch(err => console.error(err));

        // 3. Enviar SMS de confirmación (En segundo plano)
        if (data.cliente_contacto) {
            sendReservationConfirmedSMS(data.cliente_contacto, data.cliente_nombre).catch(err => console.error(err));
        }

        // 4. Enviar WhatsApp de confirmación (En segundo plano)
        if (data.cliente_contacto) {
            sendReservationConfirmedWhatsApp(data.cliente_contacto, data.cliente_nombre).catch(err => console.error(err));
        }

        await pool.query("COMMIT");

        res.status(200).json({ 
            success: true, 
            message: "Reserva confirmada exitosamente y correo enviado." 
        });

    } catch (error) {
        await pool.query("ROLLBACK");
        console.error("Error confirmando reserva:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const rejectReservationPayment = async (req, res) => {
    try {
        const { id } = req.params;
        const { motivo } = req.body;

        await pool.query("BEGIN");

        // Obtenemos los datos de la reserva antes de rechazar
        const result = await pool.query(
          "SELECT r.*, c.email AS cliente_email, c.nombre AS cliente_nombre, c.contacto AS cliente_contacto FROM reservas r JOIN clientes c ON r.cliente_id = c.cliente_id WHERE r.reserva_id = $1", 
          [id]
        );

        if (result.rows.length === 0) {
            await pool.query("ROLLBACK");
            return res.status(404).json({ message: "La reserva no existe." });
        }

        const data = result.rows[0];

        // Usamos cancelReservation del model o simplemente actualizamos el estado
        await pool.query("UPDATE reservas SET estado = 'Cancelada' WHERE reserva_id = $1", [id]);

        // Enviar correo electrónico de rechazo (En segundo plano)
        if (data.cliente_email) {
            sendReservationRejectedEmail(data.cliente_email, data.cliente_nombre, motivo).catch(err => console.error(err));
        }

        // Enviar SMS de rechazo (En segundo plano)
        if (data.cliente_contacto) {
            sendReservationRejectedSMS(data.cliente_contacto, data.cliente_nombre, motivo).catch(err => console.error(err));
        }

        // Enviar WhatsApp de rechazo (En segundo plano)
        if (data.cliente_contacto) {
            sendReservationRejectedWhatsApp(data.cliente_contacto, data.cliente_nombre, motivo).catch(err => console.error(err));
        }

        await pool.query("COMMIT");

        res.status(200).json({ 
            success: true, 
            message: "Reserva rechazada exitosamente y correo enviado." 
        });

    } catch (error) {
        await pool.query("ROLLBACK");
        console.error("Error rechazando reserva:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getLatestReservationId = async (req, res) => {
  try {
    const result = await pool.query("SELECT MAX(reserva_id) as latest_id FROM reservas");
    res.json({ latest_id: result.rows[0].latest_id || 0 });
  } catch (error) {
    console.error("Error al obtener el ID de la última reserva:", error);
    res.status(500).json({ error: error.message });
  }
};

import { sendRescheduleEmail } from "../services/nodemailer.service.js";

export const rescheduleReservation = async (req, res) => {
    try {
        const { id } = req.params;
        const { llegada, salida } = req.body;

        await pool.query("BEGIN");

        // Validar que la reserva exista
        const result = await pool.query(
            "SELECT r.*, c.email AS cliente_email, c.nombre AS cliente_nombre, c.contacto AS cliente_contacto FROM reservas r JOIN clientes c ON r.cliente_id = c.cliente_id WHERE r.reserva_id = $1", 
            [id]
        );

        if (result.rows.length === 0) {
            await pool.query("ROLLBACK");
            return res.status(404).json({ message: "La reserva no existe." });
        }

        const data = result.rows[0];

        // Actualizar fechas
        await pool.query(
            "UPDATE reservas SET llegada = $1, salida = $2 WHERE reserva_id = $3",
            [llegada, salida, id]
        );

        const llegadaFormateada = new Date(llegada).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
        const salidaFormateada = new Date(salida).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });

        // Enviar correo electrónico (En segundo plano)
        if (data.cliente_email) {
            sendRescheduleEmail(data.cliente_email, data.cliente_nombre, llegadaFormateada, salidaFormateada).catch(err => console.error(err));
        }

        // Enviar WhatsApp de reprogramación (En segundo plano)
        if (data.cliente_contacto) {
            sendRescheduleWhatsApp(data.cliente_contacto, data.cliente_nombre, llegadaFormateada, salidaFormateada).catch(err => console.error(err));
        }

        await pool.query("COMMIT");

        res.status(200).json({ 
            success: true, 
            message: "Reserva reprogramada exitosamente y correo enviado." 
        });

    } catch (error) {
        await pool.query("ROLLBACK");
        console.error("Error reprogramando reserva:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getReservationServices = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
            SELECT s.servicio AS nombre, sp.cantidad_personas, s.precio
            FROM servicios_por_paquete sp
            JOIN vista_servicios s ON sp.servicio_id = s.id
            JOIN paquetes p ON p.paquete_id = sp.paquete_id
            JOIN reservas r ON r.paquete_id = p.paquete_id
            WHERE r.reserva_id = $1
        `, [id]);
        
        res.json(result.rows);
    } catch (error) {
        console.error("Error al obtener servicios de la reserva:", error);
        res.status(500).json({ error: error.message });
    }
};

import { sendForceMajeureCancelEmail } from "../services/nodemailer.service.js";

export const cancelReservationForceMajeure = async (req, res) => {
    try {
        const { id } = req.params;

        await pool.query("BEGIN");

        // Validar que la reserva exista y obtener email y nombre del cliente
        const result = await pool.query(
            "SELECT r.*, c.email AS cliente_email, c.nombre AS cliente_nombre FROM reservas r JOIN clientes c ON r.cliente_id = c.cliente_id WHERE r.reserva_id = $1", 
            [id]
        );

        if (result.rows.length === 0) {
            await pool.query("ROLLBACK");
            return res.status(404).json({ message: "La reserva no existe." });
        }

        const data = result.rows[0];

        // Cambiar el estado a "Cancelada"
        await pool.query("UPDATE reservas SET estado = 'Cancelada' WHERE reserva_id = $1", [id]);

        // Enviar correo electrónico de cancelación (En segundo plano)
        if (data.cliente_email) {
            sendForceMajeureCancelEmail(data.cliente_email, data.cliente_nombre).catch(err => console.error(err));
        }

        // Enviar WhatsApp de cancelación por fuerza mayor (En segundo plano)
        if (data.cliente_contacto) {
            // Usamos la misma función de rechazo con un motivo fijo
            sendReservationRejectedWhatsApp(
                data.cliente_contacto, 
                data.cliente_nombre, 
                "Motivos de fuerza mayor. Nuestro equipo de soporte se contactará contigo."
            ).catch(err => console.error(err));
        }

        await pool.query("COMMIT");

        res.status(200).json({ 
            success: true, 
            message: "Reserva cancelada por fuerza mayor y correo enviado." 
        });

    } catch (error) {
        await pool.query("ROLLBACK");
        console.error("Error cancelando reserva por fuerza mayor:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};