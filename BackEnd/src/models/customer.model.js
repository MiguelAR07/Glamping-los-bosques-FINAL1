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
  `
}