import 'dotenv/config';
import pool from './src/config/db.js';

async function createPromociones() {
  try {
    const query = `
      CREATE TABLE IF NOT EXISTS Promociones (
        promocion_id SERIAL PRIMARY KEY,
        titulo VARCHAR(255) NOT NULL,
        descripcion TEXT,
        cabana_id INT REFERENCES cabanas(cabana_id),
        dias_estadia INT NOT NULL,
        precio_promocional DECIMAL(10,2) NOT NULL,
        img_url VARCHAR(255),
        estado VARCHAR(50) DEFAULT 'Activo',
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await pool.query(query);
    console.log("Tabla Promociones creada exitosamente.");
  } catch (error) {
    console.error("Error creando tabla Promociones:", error);
  } finally {
    process.exit();
  }
}

createPromociones();
