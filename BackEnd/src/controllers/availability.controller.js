import pool from '../config/db.js';
import { availabilityQueries } from '../models/availability.model.js';

export const getEvents = async (req, res) => {
    try {
        const result = await pool.query(availabilityQueries.getEvents);
        res.json(result.rows);
    } catch (error) {
        console.error("Error al obtener los eventos:", error);
        res.status(500).json({ message: "Error al obtener la disponibilidad" });
    }
};

import { transporter } from '../services/nodemailer.service.js';

export const addBlockedDate = async (req, res) => {
    const { cabanas_ids, cabana_id, fecha_inicio, fecha_fin, motivo } = req.body;
    
    // Soporte para cliente antiguo (cabana_id) o nuevo (cabanas_ids)
    let incomingIds = cabanas_ids || [];
    if (cabana_id && incomingIds.length === 0) {
        incomingIds = [cabana_id];
    }

    if (!incomingIds || incomingIds.length === 0) {
        return res.status(400).json({ message: "Debes seleccionar al menos una cabaña." });
    }

    let idsToBlock = [];
    if (incomingIds.includes('all')) {
        idsToBlock = [null]; // null significa todas las cabañas en fechas_bloqueadas
    } else {
        idsToBlock = incomingIds.map(id => parseInt(id, 10)).filter(id => !isNaN(id));
    }

    if (idsToBlock.length === 0 && !incomingIds.includes('all')) {
        return res.status(400).json({ message: "Los IDs de las cabañas no son válidos." });
    }

    try {
        await pool.query('BEGIN');
        let insertedRows = [];

        for (let cId of idsToBlock) {
            const result = await pool.query(availabilityQueries.addBlockedDate, [
                cId,
                fecha_inicio,
                fecha_fin,
                motivo
            ]);
            insertedRows.push(result.rows[0]);
        }
        await pool.query('COMMIT');

        // Enviar correo de notificación al admin en segundo plano
        try {
            const llegadaFormateada = new Date(fecha_inicio).toLocaleDateString('es-CO', { timeZone: 'America/Bogota', year: 'numeric', month: '2-digit', day: '2-digit' });
            const salidaFormateada = new Date(fecha_fin).toLocaleDateString('es-CO', { timeZone: 'America/Bogota', year: 'numeric', month: '2-digit', day: '2-digit' });
            
            const cabanasTexto = idsToBlock.includes(null) ? 'Todas las cabañas' : `IDs: ${idsToBlock.join(', ')}`;
            
            await transporter.sendMail({
                from: '"Sistema Glamping" <glampinglosbosques9@gmail.com>',
                to: process.env.EMAIL_USER || 'panelglampinglosbosques@gmail.com',
                subject: '🔒 Nueva Fecha Bloqueada (Calendario)',
                html: `<h1>Fecha Bloqueada en Calendario</h1>
                       <p>Se ha registrado un nuevo bloqueo de disponibilidad desde el módulo de calendario.</p>
                       <ul>
                           <li><strong>Cabañas bloqueadas:</strong> ${cabanasTexto}</li>
                           <li><strong>Desde:</strong> ${llegadaFormateada}</li>
                           <li><strong>Hasta:</strong> ${salidaFormateada}</li>
                           <li><strong>Motivo / Detalle:</strong> ${motivo}</li>
                       </ul>
                       <p>Revisa el panel de control para más detalles.</p>`
            });
        } catch (emailErr) {
            console.error("Error enviando correo de bloqueo:", emailErr);
        }

        res.status(201).json({ message: "Fechas bloqueadas con éxito", data: insertedRows });
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error("Error al bloquear fecha:", error);
        res.status(500).json({ message: "Error en la BD al guardar el bloqueo: " + error.message });
    }
};

export const deleteBlockedDate = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(availabilityQueries.deleteBlockedDate, [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Bloqueo no encontrado" });
        }
        res.json({ message: "Bloqueo eliminado correctamente" });
    } catch (error) {
        console.error("Error al eliminar bloqueo:", error);
        res.status(500).json({ message: "Error al eliminar la fecha bloqueada" });
    }
};
