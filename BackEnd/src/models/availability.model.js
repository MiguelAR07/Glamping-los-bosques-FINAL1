export const availabilityQueries = {
  getEvents: `
    SELECT 
        r.reserva_id AS id, 
        'reserva' as tipo, 
        c.nombre AS title, 
        r.llegada AS "start", 
        r.salida AS "end", 
        p.cabana_id,
        cab.nombre as cabana_nombre,
        r.estado
    FROM reservas r
    JOIN clientes c ON r.cliente_id = c.cliente_id
    JOIN paquetes p ON r.paquete_id = p.paquete_id
    JOIN cabanas cab ON p.cabana_id = cab.cabana_id
    WHERE r.estado <> 'Cancelado'
    
    UNION ALL
    
    SELECT 
        fb.id, 
        'bloqueo' as tipo, 
        fb.motivo AS title, 
        (fb.fecha_inicio::text || 'T00:00:00')::timestamp with time zone AS "start", 
        (fb.fecha_fin::text || 'T00:00:00')::timestamp with time zone AS "end",
        fb.cabana_id,
        COALESCE(cab.nombre, 'Todas las Cabañas') as cabana_nombre,
        'Bloqueado' as estado
    FROM fechas_bloqueadas fb
    LEFT JOIN cabanas cab ON fb.cabana_id = cab.cabana_id
  `,
  addBlockedDate: `
    INSERT INTO fechas_bloqueadas (cabana_id, fecha_inicio, fecha_fin, motivo)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `,
  deleteBlockedDate: `
    DELETE FROM fechas_bloqueadas
    WHERE id = $1
    RETURNING *;
  `
};
