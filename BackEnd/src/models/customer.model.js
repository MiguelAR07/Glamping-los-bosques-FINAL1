export const customer = {
  getCustomerData: `
    SELECT 
      * 
    FROM vista_clientes
  `,
  getCustomerById: `
    SELECT 
      * 
    FROM vista_clientes
    WHERE id = $1
  `,
  createCustomer: `
    INSERT INTO clientes (nombre, email, contacto, tipo_identificacion, numero_identificacion, pais_residencia)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING cliente_id, nombre
  `,
  getAllEmails: `
    SELECT DISTINCT email 
    FROM clientes 
    WHERE email IS NOT NULL AND email != ''
  `,
  getCustomerSecurityLog: `
    SELECT 
      r.reserva_id AS id,
      c.nombre AS "Cliente",
      c.numero_identificacion AS "Identificación",
      c.contacto AS "Contacto",
      c.email AS "Correo",
      r.llegada AS "Fecha de Entrada",
      r.salida AS "Fecha de Salida",
      cab.nombre AS "Cabaña"
    FROM clientes c
    JOIN reservas r ON c.cliente_id = r.cliente_id
    JOIN paquetes p ON r.paquete_id = p.paquete_id
    JOIN cabanas cab ON p.cabana_id = cab.id
    WHERE r.estado NOT IN ('Cancelado', 'Cancelada')
    ORDER BY r.llegada DESC;
  `
}