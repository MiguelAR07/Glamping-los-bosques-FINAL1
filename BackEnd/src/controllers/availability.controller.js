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
    const { cabana_id, fecha_inicio, fecha_fin, motivo } = req.body;
    
    // Si cabana_id viene vacío o como "all", lo ponemos a null para bloquear todas
    const cabanaIdVal = (cabana_id === 'all' || !cabana_id) ? null : parseInt(cabana_id, 10);

    try {
        const result = await pool.query(availabilityQueries.addBlockedDate, [
            cabanaIdVal,
            fecha_inicio,
            fecha_fin,
            motivo
        ]);

        // Enviar correo de notificación al admin en segundo plano
        try {
            const llegadaFormateada = new Date(fecha_inicio).toLocaleDateString('es-CO', { timeZone: 'America/Bogota', year: 'numeric', month: '2-digit', day: '2-digit' });
            const salidaFormateada = new Date(fecha_fin).toLocaleDateString('es-CO', { timeZone: 'America/Bogota', year: 'numeric', month: '2-digit', day: '2-digit' });
            
            await transporter.sendMail({
                from: '"Sistema Glamping" <glampinglosbosques9@gmail.com>',
                to: process.env.EMAIL_USER || 'panelglampinglosbosques@gmail.com',
                subject: '🔒 Nueva Fecha Bloqueada (Calendario)',
                html: `<h1>Fecha Bloqueada en Calendario</h1>
                       <p>Se ha registrado un nuevo bloqueo de disponibilidad desde el módulo de calendario.</p>
                       <ul>
                           <li><strong>Cabaña ID:</strong> ${cabanaIdVal || 'Todas las cabañas'}</li>
                           <li><strong>Desde:</strong> ${llegadaFormateada}</li>
                           <li><strong>Hasta:</strong> ${salidaFormateada}</li>
                           <li><strong>Motivo / Detalle:</strong> ${motivo}</li>
                       </ul>
                       <p>Revisa el panel de control para más detalles.</p>`
            });
        } catch (emailErr) {
            console.error("Error enviando correo de bloqueo:", emailErr);
        }

        res.status(201).json({ message: "Fecha bloqueada con éxito", data: result.rows[0] });
    } catch (error) {
        console.error("Error al bloquear fecha:", error);
        res.status(500).json({ message: "Error al guardar el bloqueo de fecha" });
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
