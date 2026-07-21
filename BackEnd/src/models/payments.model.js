export const payment = {
  getPayments: `
    SELECT
      * 
    FROM vista_pagos
    ORDER BY fecha DESC
  `,
  getPaymentByInvoice: `
    SELECT
      * 
    FROM vista_pagos
    WHERE factura = $1
  `,
  createPaymentManually: `
    INSERT INTO pagos (factura_id, fecha_pago, metodo_id, estado, total_pagado)
    SELECT $1, CURRENT_DATE, $2, $3, $4
    WHERE EXISTS (
      SELECT 1 FROM facturas f
      JOIN reservas r ON f.reserva_id = r.reserva_id
      JOIN clientes c ON r.cliente_id = c.cliente_id
      WHERE f.factura_id = $1 AND c.email = $5
    )
    AND EXISTS (SELECT 1 FROM metodos_pago WHERE metodo_id = $2)
    RETURNING 
      factura_id, 
      total_pagado,
      (SELECT reserva_id FROM facturas WHERE factura_id = $1) AS reserva_id;
  `,
  createPaymentWithApi: `
    INSERT INTO pagos (factura_id, fecha_pago, metodo_id, estado, total_pagado)
    SELECT $1, CURRENT_DATE, $2, $3, $4
    WHERE EXISTS (
      SELECT 1 
      FROM facturas f
      JOIN reservas r ON f.reserva_id = r.reserva_id
      JOIN clientes c ON r.cliente_id = c.cliente_id
      WHERE f.factura_id = $1 AND c.email = $5
    )
    AND EXISTS (SELECT 1 FROM metodos_pago WHERE metodo_id = $2)
    RETURNING factura_id, fecha_pago;
  `,
}

// El estado debe dar 2 valores
// 1. aceptado
// 2. rechazado
// y es devuelto por la api de pagos

// facuraid no se ingresa manualmente, se obtiene de facturas

// Nota: ajustar para que el total mostrado en frontend
// sea la suma de todos los pagos por factura, con el fin 
// de que si un cliente paga 2 veces, el sistema muestre que pagó el total

export const paymentFilters = {
  getRecentPayments: `
    SELECT
      *
    FROM vista_pagos
    ORDER BY fecha DESC
  `,
  getSucefullyPayments: `
    SELECT
      *
    FROM vista_pagos
    WHERE estado = 'Completado'
    ORDER BY fecha DESC
  `,
  // getRejectedPayments: `
  //   SELECT
  //     *
  //   FROM vista_pagos
  //   WHERE estado = 'Rechazado'
  //   ORDER BY fecha DESC
  // `,
}

export const paymentStats = {
  getSuccessfulPayments: `
    SELECT 
      COUNT(id) AS "Pagos exitosos"
    FROM vista_pagos
    WHERE estado IN ('Completado', 'Agregado Manual')
      AND fecha >= DATE_TRUNC('month', CURRENT_DATE)
  `,
  getRejectedPayments: `
    SELECT 
      COUNT(id) AS "Pagos rechazados"
    FROM vista_pagos
    WHERE estado = 'Rechazado'
      AND fecha >= DATE_TRUNC('month', CURRENT_DATE)
  `,
  getPendingRefunds: `
    SELECT 
      COUNT(id) AS "Reembolsos pendientes"
    FROM vista_reembolsos_factura
    WHERE estado = 'Pendiente'
      AND fecha >= DATE_TRUNC('month', CURRENT_DATE)
  `,
  getRevenue: `
    SELECT 
      saldo_neto_mes::FLOAT AS "Ingresos"
    FROM vista_pagos_stats
  `,
  getRevenueGraph: `
    SELECT 
      TO_CHAR(fecha_pago, 'YYYY-MM-DD') AS fecha,
      SUM(total_pagado)::FLOAT AS total
    FROM pagos
    WHERE estado IN ('Completado', 'Agregado Manual')
    GROUP BY TO_CHAR(fecha_pago, 'YYYY-MM-DD')
    ORDER BY fecha ASC
    LIMIT 30;
  `,
  getRevenueByCabin: `
    SELECT 
      cb.nombre AS cabana,
      SUM(pa.total_pagado)::FLOAT AS total
    FROM pagos pa
    JOIN facturas f ON pa.factura_id = f.factura_id
    JOIN reservas r ON f.reserva_id = r.reserva_id
    JOIN paquetes p ON r.paquete_id = p.paquete_id
    JOIN cabanas cb ON p.cabana_id = cb.cabana_id
    WHERE pa.estado IN ('Completado', 'Agregado Manual')
    GROUP BY cb.nombre
    ORDER BY total DESC;
  `,
  getPaymentsByMethod: `
    SELECT 
      m.nombre AS metodo,
      SUM(pa.total_pagado)::FLOAT AS total
    FROM pagos pa
    JOIN metodos_pago m ON pa.metodo_id = m.metodo_id
    WHERE pa.estado IN ('Completado', 'Agregado Manual')
    GROUP BY m.nombre;
  `
}
