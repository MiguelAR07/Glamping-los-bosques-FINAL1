-------------------------- Views servicios -----------------------------
CREATE OR REPLACE VIEW vista_servicios AS
SELECT
	servicio_id AS ID,
	nombre AS Servicio,
	encargado,
	duracion_minutos AS "Duracion en minutos",
	precio,
	descripcion, 
	fecha_actualizacion AS Actualizacion,
	estado
FROM Servicios;

CREATE OR REPLACE VIEW vista_servicios_stats AS
SELECT
    s.nombre AS servicio,
    COUNT(s.servicio_id) AS veces_reservado,
    SUM(s.precio) AS ingresos_generados
FROM servicios s
LEFT JOIN servicios_Por_Paquete spq ON s.servicio_id = spq.servicio_id
LEFT JOIN paquetes p ON spq.paquete_id = p.paquete_id
LEFT JOIN reservas r ON r.paquete_id = p.paquete_id
WHERE s.estado = 'Activo' 
  AND r.estado IN ('Pagado', 'Completado')
GROUP BY s.nombre, s.servicio_id;

-------------------------- Views productos -----------------------------
CREATE OR REPLACE VIEW vista_productos AS
SELECT
	producto_id AS ID,
	nombre AS Producto,
	tipo,
	precio,
	descripcion,
	fecha_actualizacion AS Actualizacion, 
	estado
FROM productos;

CREATE OR REPLACE VIEW vista_productos_stats AS
SELECT
    p.nombre AS producto,
    COUNT(p.producto_id) AS veces_reservado,
    SUM(p.precio) AS ingresos_generados
FROM productos p
LEFT JOIN productos_por_paquete ppq ON p.producto_id = ppq.producto_id
JOIN paquetes pq ON ppq.paquete_id = pq.paquete_id
JOIN reservas r ON r.paquete_id = pq.paquete_id
WHERE p.estado = 'Activo' 
  AND r.estado = 'Confirmada'
GROUP BY p.nombre, p.producto_id;

-------------------------- Views cabañas -----------------------------
CREATE OR REPLACE VIEW vista_cabanas AS
SELECT 
	cabana_id AS ID,
	nombre,
	precio_noche AS "precio noche",
	capacidad_personas AS capacidad,
	fecha_registro AS actualizacion,
	descripcion,
	fecha_mantenimiento AS mantenimiento,
	estado
FROM cabanas;

CREATE OR REPLACE VIEW vista_cabanas_stats AS
SELECT
  	c.nombre AS "Cabaña",
    COUNT(DISTINCT r.reserva_id) AS "Veces reservada",
    COALESCE(SUM(f.total), 0) AS "Ingresos generados"  
FROM cabanas c  
LEFT JOIN paquetes p ON c.cabana_id = p.cabana_id
LEFT JOIN reservas r ON p.paquete_id = r.paquete_id
LEFT JOIN facturas f ON r.reserva_id = f.reserva_id
WHERE c.estado <> 'inactivo'
	AND r.estado <> 'Cancelada'
GROUP BY c.cabana_id, c.nombre;

CREATE OR REPLACE VIEW vista_cabanas_revenue AS
SELECT
  TO_CHAR(f.fecha_factura, 'YYYY-MM-DD') AS fecha,
  SUM(f.total) AS total
FROM facturas f
JOIN reservas r ON f.reserva_id = r.reserva_id
JOIN paquetes p ON r.paquete_id = p.paquete_id
JOIN cabanas c ON p.cabana_id = c.cabana_id
WHERE c.estado <> 'inactivo'
  AND r.estado <> 'Cancelada'
GROUP BY TO_CHAR(f.fecha_factura, 'YYYY-MM-DD');

-------------------------- Views daños y mantenimientos -----------------------------
CREATE OR REPLACE VIEW vista_danos_mantenimientos AS
SELECT
	dm.dano_id AS ID,
	c.nombre AS cabana,
	dm.descripcion,
	dm.estado,
	dm.fecha_registro AS registro,
	dm.fecha_arreglo AS Arreglo,
	dm.responsable
FROM danos_mantenimientos dm
JOIN cabanas c ON c.cabana_id = dm.cabana_id;

-------------------------- Views usuarios -----------------------------
CREATE OR REPLACE VIEW vista_usuarios AS
SELECT 
	u.usuario_id AS ID,
	r.nombre AS Rol,
	u.rol_id,
	u.tipo_identificacion AS "Tipo Ident..",
	u.numero_identificacion AS "# Identificacion",
	u.nombre AS Usuario,
	u.contacto AS Contacto,
	u.sueldo AS Sueldo,
	u.estado AS Estado
FROM usuarios u 
JOIN roles r ON u.rol_id = r.rol_id;

CREATE OR REPLACE VIEW vista_usuarios_stats AS
SELECT 
  	COUNT(*) AS total_active_users,
	(
  		SELECT nombre 
  		FROM usuarios 
		WHERE estado = 'Activo'
		ORDER BY sueldo DESC
		LIMIT 1
	) AS highest_payroll,
  	(
	  	SELECT nombre 
		FROM usuarios 
		WHERE estado = 'Activo'
		ORDER BY sueldo ASC
		LIMIT 1
	) AS lowest_payroll,
  SUM(sueldo) AS total_payroll
FROM usuarios;

-------------------------- Views login -----------------------------
CREATE OR REPLACE VIEW vista_login AS
SELECT 
	l.usuario_id AS usuario,
	u.rol_id AS rol,
	l.email,
	l.contrasena,
	l.estado
FROM login l
JOIN usuarios u ON u.usuario_id = l.usuario_id;

-------------------------- Views logs - login -----------------------------
CREATE OR REPLACE VIEW vista_logs_login AS
SELECT 
	l.email,
	ll.accion,
	ll.fecha_hora AS fecha,
	ll.detalles
FROM logs_login ll
JOIN login l ON ll.login_id = l.login_id;

-------------------------- Views paquetes -----------------------------
CREATE OR REPLACE VIEW vista_paquetes AS
SELECT 
	p.paquete_id AS ID,
	tp.nombre AS Tipo,
	c.nombre AS "Cabaña",
	p.dias_estadia AS Dias,
	p.fecha_registro AS fecha,
	p.descripcion,
	p.estado,
    p.tipo_id,
    p.cabana_id
FROM paquetes p
JOIN tipo_paquete tp ON tp.tipo_id = p.tipo_id
JOIN cabanas c ON c.cabana_id = p.cabana_id;

CREATE OR REPLACE VIEW vista_paquetes_stats AS
SELECT
    tp.nombre AS Tipo,
    COUNT(r.reserva_id) AS veces_reservado
FROM tipo_paquete tp
LEFT JOIN paquetes p ON p.tipo_id = tp.tipo_id AND p.estado = 'Activo'
LEFT JOIN reservas r ON r.paquete_id = p.paquete_id AND r.estado IN ('Pagado', 'Completado')
GROUP BY tp.nombre;

-------------------------- Views de servicios por paquete -----------------------------
CREATE OR REPLACE VIEW vista_servicios_por_paquete AS
SELECT
	sp.servicio_paquete_id AS ID,
	p.paquete_id, -- Para los join a reservas
	p.nombre AS paquete,
	s.nombre AS servicio,
	s.img_url,
	cantidad_personas AS personas
FROM servicios_por_paquete sp
JOIN paquetes p ON p.paquete_id = sp.paquete_id
JOIN servicios s ON s.servicio_id = sp.servicio_id;

-------------------------- Views de productos por paquete -----------------------------
CREATE OR REPLACE VIEW vista_productos_por_paquete AS
SELECT
	ppq.producto_paquete_id AS ID,
	pq.paquete_id, -- Para los join a reservas
	pq.nombre AS paquete,
	p.nombre AS producto,
	p.img_url,
	cantidad
FROM productos_por_paquete ppq
JOIN paquetes pq ON pq.paquete_id = ppq.paquete_id
JOIN productos p ON p.producto_id = ppq.producto_id;

-------------------------- Views de clientes -----------------------------
CREATE OR REPLACE VIEW vista_clientes AS
SELECT
	c.cliente_id AS ID,
	c.tipo_identificacion AS "Tipo Ident..",
	c.numero_identificacion AS "# Identificacion",
	c.nombre AS cliente,
	c.email,
	c.contacto,
	c.pais_residencia AS residencia
FROM clientes c;

-------------------------- Views de reservas -----------------------------
CREATE OR REPLACE VIEW vista_reservas AS
SELECT 
	r.reserva_id AS ID,
	tp.nombre || ' - ' || p.nombre AS Paquete,
	c.nombre AS Cliente,
    c.contacto AS "Celular",
    c.numero_identificacion AS "Cédula",
	r.fecha_registro AS fecha,
	r.llegada,
	r.salida,
	r.estado,
	r.por_pagar AS "Pago restante"
FROM Reservas r
JOIN Clientes c ON c.cliente_id = r.cliente_id
JOIN Paquetes p ON p.paquete_id = r.paquete_id
JOIN tipo_paquete tp ON tp.tipo_id = p.tipo_id;

CREATE OR REPLACE VIEW vista_reservas_revenue AS
SELECT
  TO_CHAR(f.fecha_factura, 'YYYY-MM-DD') AS fecha,
  SUM(f.total) AS total
FROM reservas r
JOIN facturas f ON f.reserva_id = r.reserva_id
WHERE r.estado <> 'Cancelada'
GROUP BY TO_CHAR(f.fecha_factura, 'YYYY-MM-DD');

-------------------------- Views de facturas -----------------------------
CREATE OR REPLACE VIEW vista_facturas AS
SELECT 
	f.factura_id AS ID,
	f.reserva_id AS Reserva,
	c.nombre AS Cliente,
	f.fecha_factura AS fecha,
	f.subtotal,
	f.total
FROM facturas f
LEFT JOIN pagos p ON f.factura_id = p.factura_id
JOIN reservas r ON r.reserva_id = f.reserva_id
JOIN clientes c ON c.cliente_id = r.cliente_id
WHERE r.estado <> 'Cancelada';

-------------------------- Views de pagos -----------------------------
CREATE OR REPLACE VIEW vista_pagos AS
SELECT 
	p.pago_id AS ID,
	mp.nombre AS Metodo,
	p.factura_id AS Factura,
	p.fecha_pago AS Fecha,
	p.estado,
	p.total_pagado
FROM pagos p
JOIN metodos_pago mp ON mp.metodo_id = p.metodo_id;

CREATE OR REPLACE VIEW vista_pagos_stats AS
SELECT 
    SUM(CASE WHEN tipo = 'pago' THEN monto ELSE 0 END) AS total_cobrado,
    SUM(CASE WHEN tipo = 'reembolso' THEN monto ELSE 0 END) AS total_reembolsado,
    SUM(CASE WHEN tipo = 'pago' THEN monto ELSE -monto END) AS saldo_neto_mes
FROM (
    SELECT fecha_pago AS fecha, total_pagado AS monto, 'pago' AS tipo 
    FROM pagos 
    WHERE estado != 'Cancelado'
      AND fecha_pago >= DATE_TRUNC('month', CURRENT_DATE) -- Filtra antes del UNION
    UNION ALL
    SELECT fecha, monto, 'reembolso' AS tipo 
    FROM reembolsos
    WHERE fecha >= DATE_TRUNC('month', CURRENT_DATE) -- Filtra antes del UNION
) AS reporte;

-------------------------- Views de reembolsos -----------------------------
CREATE OR REPLACE VIEW vista_reembolsos_factura AS
SELECT 
    reembolso_id AS ID,
    factura_id AS Factura,
    fecha,
    justificacion,
    estado,
    monto
FROM reembolsos;

-------------------------- Views Tipos -----------------------------

--- Tipos de paquetes

--- Roles

--- Identificaciones

--- metodos de pago

-------------------------- Indices -----------------------------

-- 1. RESERVAS Y FACTURACIÓN (Tablas de alto crecimiento)
CREATE INDEX idx_facturas_fecha_total_incl ON facturas (fecha_factura) INCLUDE (total, reserva_id);

-- Índice parcial: Ignora cancelaciones para reducir el tamaño en disco y acelerar JOINs
CREATE INDEX idx_reservas_perf ON reservas (paquete_id, cliente_id) WHERE estado <> 'Cancelada';

-- 2. TABLAS DE UNIÓN (Muchos a Muchos)
CREATE INDEX idx_spq_paquete_busqueda ON servicios_por_paquete (paquete_id, servicio_id);
CREATE INDEX idx_ppq_paquete_busqueda ON productos_por_paquete (paquete_id, producto_id);

-- 3. AUDITORÍA Y CONTROL (Tablas con inserción constante)
CREATE INDEX idx_logs_login_reciente ON logs_login (fecha_hora DESC);

CREATE INDEX idx_danos_cabana_estado ON danos_mantenimientos (cabana_id, estado);

-- 4. BÚSQUEDA Y CLIENTES
CREATE INDEX idx_clientes_nombre_pattern ON clientes (nombre varchar_pattern_ops);

-- Se usa en una actualizacion
CREATE INDEX idx_reservas_pendientes_pago 
ON reservas (llegada) 
WHERE por_pagar <= 0 AND estado <> 'Pagado' AND estado <> 'Cancelado';

-- Para acelerar el cálculo de ingresos por mes
CREATE INDEX idx_pagos_fecha_ingreso ON pagos (fecha_pago) 
WHERE estado <> 'Cancelado';

-- Para acelerar el cálculo de reembolsos por mes
CREATE INDEX idx_reembolsos_fecha ON reembolsos (fecha);


/*
	Las tablas que mas datos van a contener son: 
	- reservas, 
	- paquetes, 
	- pagos, 
	- facturas, 
	- clientes, 
	- logs_login, 
	- reembolsos, 
	- danos_mantenimientos,
	- servicios_Por_Paquete,
	- productos_por_paquete
*/