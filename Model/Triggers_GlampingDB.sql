--------- Trigger que calcula el total a pagar
CREATE OR REPLACE FUNCTION fn_calcular_total_factura()
RETURNS TRIGGER AS $$
DECLARE
    v_paquete_id INT;
    v_dias INT;
    v_costo_cabanas DECIMAL(10,2) := 0;
    v_costo_servicios DECIMAL(10,2) := 0;
    v_costo_productos DECIMAL(10,2) := 0;
    v_subtotal_calculado DECIMAL(10,2) := 0;
BEGIN
    -- 1. Obtener el PaqueteID y los días de estadía desde la Reserva
    SELECT Paquete_ID, (Salida - Llegada) INTO v_paquete_id, v_dias
    FROM Reservas WHERE Reserva_ID = NEW.Reserva_ID;

    -- Si la resta de fechas da 0 (mismo día), asumimos 1 noche mínimo
    IF v_dias = 0 THEN v_dias := 1; END IF;

    -- 2. Calcular costo de Cabañas (Precio Noche * Días)
    SELECT COALESCE(SUM(c.Precio_Noche * v_dias), 0) INTO v_costo_cabanas
    FROM cabanas c
    JOIN Paquetes p ON c.cabana_id = p.cabana_id
    WHERE p.Paquete_ID = v_paquete_id;

	-- 3. Calcular costo de Servicios (Precio * Cantidad de Personas)
    SELECT COALESCE(SUM(s.Precio * sp.Cantidad_Personas), 0) INTO v_costo_servicios
    FROM Servicios_Por_Paquete sp
    JOIN Servicios s ON sp.Servicio_ID = s.Servicio_ID
    WHERE sp.Paquete_ID = v_paquete_id;

    -- 4. Calcular costo de Productos (Precio * Cantidad)
    SELECT COALESCE(SUM(p.Precio * pp.Cantidad), 0) INTO v_costo_productos
    FROM Productos_Por_Paquete pp
    JOIN Productos p ON pp.Producto_ID = p.Producto_ID
    WHERE pp.Paquete_ID = v_paquete_id;

    -- 5. Totales finales
    v_subtotal_calculado := v_costo_cabanas + v_costo_servicios + v_costo_productos;
    
    NEW.Subtotal := v_subtotal_calculado;
    -- NEW.Total se calcula automáticamente por ser una columna GENERATED ALWAYS en Facturas

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ejecucion del trigger
CREATE OR REPLACE TRIGGER trg_actualizar_total_factura
BEFORE INSERT ON Facturas
FOR EACH ROW
EXECUTE FUNCTION fn_calcular_total_factura();