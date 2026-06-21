export const notification = {
  getNotifications: `
    SELECT
      * 
    FROM notificaciones
    ORDER BY fecha DESC
  `,
  getLastNotifications: `
    SELECT
      * 
    FROM notificaciones 
    ORDER BY fecha DESC
    LIMIT 2
  `,
  createNotification: `
    INSERT INTO notificaciones 
    (titulo, asunto, mensaje, fecha)
    VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
    RETURNING titulo, asunto
  `,
  deleteNotification: `
    DELETE FROM notificaciones 
    WHERE notificacion_id = $1
  `,
  deleteAllNotifications: `
    DELETE FROM notificaciones
  `,
}

export const getEmails = `
  SELECT
    l.email
  FROM login l
  JOIN usuarios u ON l.usuario_id = u.usuario_id 
  WHERE u.estado = 'Activo'
`