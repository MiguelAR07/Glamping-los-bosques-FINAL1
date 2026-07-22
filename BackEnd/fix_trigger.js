import dotenv from 'dotenv';
import pg from 'pg';
dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function fixTrigger() {
  try {
    const q = `
CREATE OR REPLACE FUNCTION fn_calcular_total_factura()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
    v_paquete_id INT;
    v_dias INT;
    v_costo_cabanas DECIMAL(10,2) := 0;
    v_costo_servicios DECIMAL(10,2) := 0;
    v_subtotal_calculado DECIMAL(10,2) := 0;
BEGIN
    -- 1. Obtener el PaqueteID y los días de estadía desde la Reserva
    -- SE CORRIGIÓ: Se usa DATE(Salida) - DATE(Llegada) para obtener un número entero de días
    SELECT Paquete_ID, (DATE(Salida) - DATE(Llegada)) INTO v_paquete_id, v_dias
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

    -- 4. Totales finales (sin productos, ya que la tabla no existe)
    v_subtotal_calculado := v_costo_cabanas + v_costo_servicios;
    
    NEW.Subtotal := v_subtotal_calculado;
    -- NEW.Total se calcula automáticamente por ser una columna GENERATED ALWAYS en Facturas

    RETURN NEW;
END;
$function$;
    `;
    await pool.query(q);
    console.log("TRIGGER FUNCTION UPDATED SUCCESS!");
  } catch (err) {
    console.error(err.message);
  } finally {
    process.exit(0);
  }
}

fixTrigger();
