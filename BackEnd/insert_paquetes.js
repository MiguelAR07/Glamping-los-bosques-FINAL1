import 'dotenv/config';
import pool from './src/config/db.js';

async function insertPaquetes() {
  try {
    await pool.query("BEGIN");
    
    // Insert Paquetes
    await pool.query(`
      INSERT INTO Paquetes (Cabana_ID, Tipo_ID, Registrado_Por_ID, Nombre, Dias_Estadia, Descripcion) VALUES 
      (1, 2, NULL, 'Escapada Romántica', 2, 'Ideal para parejas en aniversario'),
      (2, 1, NULL, 'Plan Familiar', 3, 'Diversión en el bosque'),
      (3, 3, NULL, 'Aventura Estelar', 1, 'Noche de telescopio')
      ON CONFLICT DO NOTHING;
    `);

    await pool.query("COMMIT");
    console.log("Paquetes insertados con éxito.");
  } catch (error) {
    await pool.query("ROLLBACK");
    console.error("DB Error:", error.message);
  } finally {
    process.exit();
  }
}
insertPaquetes();
