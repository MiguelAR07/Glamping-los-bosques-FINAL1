import pool from './src/config/db.js';

const migrate = async () => {
    try {
        await pool.query("ALTER TABLE reservas ADD COLUMN IF NOT EXISTS adultos INTEGER DEFAULT 2;");
        await pool.query("ALTER TABLE reservas ADD COLUMN IF NOT EXISTS ninos INTEGER DEFAULT 0;");
        await pool.query("ALTER TABLE reservas ADD COLUMN IF NOT EXISTS mascotas INTEGER DEFAULT 0;");

        // Update vista_reservas appending at the end
        await pool.query(`
            CREATE OR REPLACE VIEW vista_reservas AS 
            SELECT r.reserva_id AS id,
                (tp.nombre::text || ' - '::text) || p.nombre::text AS paquete,
                c.nombre AS cliente,
                c.contacto AS "Celular",
                c.numero_identificacion AS "Cédula",
                r.fecha_registro AS fecha,
                r.llegada,
                r.salida,
                r.estado,
                r.por_pagar AS "Pago restante",
                r.factura_url AS comprobante_url,
                COALESCE(( SELECT string_agg(((s.servicio::text || ' ('::text) || sp.cantidad_personas) || ' pax)'::text, ', '::text) AS string_agg
                       FROM servicios_por_paquete sp
                         JOIN vista_servicios s ON sp.servicio_id = s.id
                      WHERE sp.paquete_id = p.paquete_id), 'Ninguno'::text) AS "Servicios adicionales",
                r.adultos,
                r.ninos,
                r.mascotas
               FROM reservas r
                 JOIN clientes c ON c.cliente_id = r.cliente_id
                 JOIN paquetes p ON p.paquete_id = r.paquete_id
                 JOIN tipo_paquete tp ON tp.tipo_id = p.tipo_id;
        `);

        console.log('Migración completada!');
    } catch (e) {
        console.error('Error en migración:', e);
    } finally {
        pool.end();
    }
};

migrate();
