export const refounds = {
  getRefounds: `
    SELECT
      * 
    FROM vista_reembolsos
    ORDER BY fecha DESC
  `,
  getRefoundByInvoice: `
    SELECT
      * 
    FROM vista_reembolsos
    WHERE factura = $1
    ORDER BY fecha DESC
  `,
  createRefound: `
    INSERT INTO reembolsos (factura_id, justificacion, monto, estado)
    VALUES ($1, $2, $3, 'Pendiente')
    ON CONFLICT (factura_id) 
    DO UPDATE SET 
      monto = EXCLUDED.monto,
      estado = 'Pendiente',
      justificacion = EXCLUDED.justificacion
  `,
  updateRefound: `
    UPDATE reembolsos
    SET estado = $1
    WHERE factura_id = $2
    RETURNING factura_id, estado
  `,
}

export const refoundFilters = {
  getPendingRefunds: `
    SELECT 
      *
    FROM vista_reembolsos
    WHERE estado = 'Pendiente'
  `,
  getApprovedRefunds: `
    SELECT 
      *
    FROM vista_reembolsos
    WHERE estado = 'Aprobado'
  `,
  getRejectedRefunds: `
    SELECT 
      *
    FROM vista_reembolsos
    WHERE estado = 'Rechazado'
  `,
}