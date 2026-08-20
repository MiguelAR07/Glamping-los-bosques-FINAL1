require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function seedFullTerms() {
  const client = await pool.connect();
  try {
    console.log("Limpiando y sembrando la tabla terminos_condiciones con los 10 términos exactos de la Landing Page...");

    await client.query(`
      CREATE TABLE IF NOT EXISTS terminos_condiciones (
        id SERIAL PRIMARY KEY,
        titulo VARCHAR(255) NOT NULL,
        contenido TEXT NOT NULL,
        categoria VARCHAR(100) DEFAULT 'General',
        orden INT DEFAULT 1,
        fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Truncar la tabla para reemplazar con la lista exacta del Landing Page
    await client.query("TRUNCATE TABLE terminos_condiciones RESTART IDENTITY;");

    const landingTerms = [
      {
        titulo: "1. Política de reserva",
        contenido: "• Para confirmar tu reserva debes pagar el 50% del valor total en el momento de agendar.\n• Si no haces este pago, la reserva no queda confirmada.\n• El pago debe hacerse por los medios electrónicos indicados por el personal.\n• El 100% del valor debe estar pagado al menos 24 horas antes de tu llegada.",
        categoria: "Reservas",
        orden: 1
      },
      {
        titulo: "2. Check-in (Ingreso)",
        contenido: "• Para ingresar debes presentar tu cédula física (original). No se aceptan fotos ni copias.\n• No se permiten menores de edad. Si al llegar alguno de los huéspedes es menor, la reserva será cancelada y no se devuelve el dinero pagado.\n• El horario de ingreso es de 3:00 p.m. a 9:00 p.m., según lo acordado con el personal.",
        categoria: "Estadía",
        orden: 2
      },
      {
        titulo: "3. Check-out (Salida)",
        contenido: "• Debes salir el último día de tu estadía antes de la 1:00 p.m.",
        categoria: "Estadía",
        orden: 3
      },
      {
        titulo: "4. Comportamiento dentro del lugar",
        contenido: "• Todos los huéspedes deben mantener un buen comportamiento.\n• No está permitido hacer ruidos excesivos o molestar a otros huéspedes.\n• No se pueden realizar actividades ilegales.\n• Si algún huésped altera el orden o la tranquilidad, el establecimiento podrá tomar medidas, incluyendo llamar a la policía si es necesario.",
        categoria: "Convivencia",
        orden: 4
      },
      {
        titulo: "5. Parqueadero",
        contenido: "• El parqueadero es gratuito y al aire libre.\n• El glamping no se hace responsable por robos, pérdidas o daños en los vehículos o en objetos dejados dentro de ellos.",
        categoria: "General",
        orden: 5
      },
      {
        titulo: "6. Responsabilidad",
        contenido: "• Glamping Los Bosques no se hace responsable por situaciones fuera de su control.",
        categoria: "General",
        orden: 6
      },
      {
        titulo: "7. Cancelación por parte del establecimiento",
        contenido: "• El glamping puede cancelar reservas por causas externas (clima, fuerza mayor, etc.).\n• En ese caso, se devolverá el 100% del dinero pagado.\n• No se cubren otros gastos en los que haya incurrido el huésped.",
        categoria: "Cancelación",
        orden: 7
      },
      {
        titulo: "8. Cancelación por parte del cliente",
        contenido: "• Si cancelas con 3 días o más de anticipación, puedes cambiar la fecha sin perder el dinero.\n• La nueva fecha depende de disponibilidad y puede tener cambios en el precio según la temporada.\n• Si cancelas con menos tiempo o no te presentas, no se devuelve el dinero.",
        categoria: "Cancelación",
        orden: 8
      },
      {
        titulo: "9. Reembolsos",
        contenido: "• No se hacen devoluciones de dinero por cancelaciones del cliente.\n• Si cancelas con 3 días o más, puedes cambiar la fecha (sujeto a disponibilidad y posibles ajustes de precio).\n• Si cancelas con menos de 3 días o no te presentas, pierdes el dinero pagado.\n• Solo se hace reembolso del 100% si el glamping cancela por causas externas.\n• No se cubren gastos adicionales del cliente.",
        categoria: "Cancelación",
        orden: 9
      },
      {
        titulo: "10. Políticas de Ofertas y Tarifas",
        contenido: "• Ofertas generales: Se refieren a los servicios que ofrece Glamping Los Bosques por medio de su página u otros sitios web en donde el usuario acepta las condiciones establecidas.\n• Ofertas diseñadas a necesidad del usuario: Son los servicios que se contratan a petición de cada usuario de acuerdo con sus requerimientos y/o necesidades.\n• El usuario acepta que a partir del momento en que haga uso de las instalaciones de Glamping Los Bosques se hará responsable por el pago de todos los daños y/o perjuicios que cause a sí mismo y a sus acompañantes.\n• El valor a pagar es el publicado en la página web o plataforma de terceros. Para ambos casos el precio deberá pagarse al 50% en el momento de la reserva y el 50% restante 24 horas antes de su estadía.",
        categoria: "Reservas",
        orden: 10
      }
    ];

    for (let term of landingTerms) {
      await client.query(`
        INSERT INTO terminos_condiciones (titulo, contenido, categoria, orden)
        VALUES ($1, $2, $3, $4)
      `, [term.titulo, term.contenido, term.categoria, term.orden]);
    }

    console.log("Se insertaron exitosamente los 10 términos de la Landing Page en Supabase.");
  } catch (error) {
    console.error("Error al sembrar términos:", error);
  } finally {
    client.release();
    pool.end();
  }
}

seedFullTerms();
