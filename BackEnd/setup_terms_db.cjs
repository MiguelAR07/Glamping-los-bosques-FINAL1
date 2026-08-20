require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function setupTermsTable() {
  const client = await pool.connect();
  try {
    console.log("Creando tabla terminos_condiciones en el dominio/Supabase...");

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

    // Comprobar si ya existen registros
    const check = await client.query("SELECT COUNT(*) FROM terminos_condiciones");
    if (parseInt(check.rows[0].count) === 0) {
      console.log("Insertando términos y condiciones iniciales por defecto...");

      const initialTerms = [
        {
          titulo: "1. Reservas y Pagos",
          contenido: "Para confirmar una reserva se requiere el pago anticipado del valor total o el abono acordado (mínimo el 50%). El saldo restante deberá pagarse antes o al momento del check-in mediante los métodos de pago habilitados.",
          categoria: "Reservas",
          orden: 1
        },
        {
          titulo: "2. Políticas de Cancelación y Reprogramación",
          contenido: "Las cancelaciones realizadas con más de 7 días de anticipación tendrán derecho a reprogramación o reembolso parcial del abono según los términos del establecimiento. Cancelaciones con menos de 48 horas antes del check-in no tendrán reembolso.",
          categoria: "Cancelación",
          orden: 2
        },
        {
          titulo: "3. Check-In y Check-Out",
          contenido: "El horario estándar de Check-In es a partir de las 3:00 PM y el Check-Out es hasta las 11:00 AM del día de salida. El incumplimiento del horario de salida puede generar cargos adicionales.",
          categoria: "Estadía",
          orden: 3
        },
        {
          titulo: "4. Normas de Convivencia y Cuidado de las Instalaciones",
          contenido: "Se exige un comportamiento respetuoso con el medio ambiente, el personal y los demás huéspedes. El huésped se hace responsable por cualquier daño ocasionado a las instalaciones, equipamiento o decoración de las cabañas durante su estadía.",
          categoria: "Convivencia",
          orden: 4
        },
        {
          titulo: "5. Uso de Zonas Comunes y Mascotas",
          contenido: "El acceso a zonas comunes, mallas catamarán, jacuzzis y fogatas debe realizarse bajo las recomendaciones de seguridad descritas. El ingreso de mascotas está sujeto a previa notificación y aceptación de la política Pet Friendly.",
          categoria: "General",
          orden: 5
        }
      ];

      for (let term of initialTerms) {
        await client.query(`
          INSERT INTO terminos_condiciones (titulo, contenido, categoria, orden)
          VALUES ($1, $2, $3, $4)
        `, [term.titulo, term.contenido, term.categoria, term.orden]);
      }
      console.log("Términos iniciales insertados con éxito.");
    } else {
      console.log("La tabla terminos_condiciones ya contiene registros.");
    }

  } catch (error) {
    console.error("Error al configurar la tabla terminos_condiciones:", error);
  } finally {
    client.release();
    pool.end();
  }
}

setupTermsTable();
