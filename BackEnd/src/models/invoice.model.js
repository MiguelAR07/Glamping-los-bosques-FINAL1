export const invoice = {
  getInvoices: `
    SELECT
      * 
    FROM vista_facturas
    ORDER BY fecha DESC
  `,
  getInvoiceByReservation: `
    SELECT
      * 
    FROM facturas
    WHERE reserva_id = $1
  `,
  getInvoicesByClient: `
    SELECT
      * 
    FROM vista_facturas
    WHERE cliente ILIKE '%' || $1 || '%'
  `,
  createInvoice: `
    INSERT INTO facturas (reserva_id, fecha_factura, subtotal, descuento, total_restante)
    SELECT 
      r.reserva_id,    
      CURRENT_DATE,   
      $1,             
      $2,             
      $1 * (1 - $2 / 100.0)           
    FROM reservas r
    WHERE r.reserva_id = $3
    RETURNING factura_id, fecha_factura, total;
  `,
  // Se actualiza el total de la factura cuando se agregan nuevos productos o servicios
  updateInvoiceByPackage: `
    UPDATE Facturas
    SET 
      subtotal = $1, -- El nuevo subtotal calculado en el Backend
      total = $1 - ($1 * (COALESCE(descuento, 0) / 100))
    WHERE reserva_id = $2
    RETURNING total;
  `,
}