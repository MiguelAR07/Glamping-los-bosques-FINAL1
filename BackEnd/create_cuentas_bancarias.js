import dotenv from 'dotenv';
dotenv.config();
import pool from './src/config/db.js';

async function createTable() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS cuentas_bancarias (
        id SERIAL PRIMARY KEY,
        banco VARCHAR(100) NOT NULL,
        tipo_cuenta VARCHAR(100) NOT NULL,
        numero_cuenta VARCHAR(100) NOT NULL,
        titular VARCHAR(150) NOT NULL,
        estado BOOLEAN DEFAULT TRUE,
        fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const res = await client.query('SELECT COUNT(*) FROM cuentas_bancarias');
    if (parseInt(res.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO cuentas_bancarias (banco, tipo_cuenta, numero_cuenta, titular, estado)
        VALUES 
          ('Bancolombia', 'Ahorros', '123-456789-00', 'Glamping Los Bosques SAS', true),
          ('Nequi', 'Celular', '310 359 9065', 'Glamping Los Bosques SAS', true)
      `);
      console.log('Datos iniciales de cuentas_bancarias insertados.');
    } else {
      console.log('La tabla cuentas_bancarias ya tiene datos.');
    }

    await client.query('COMMIT');
    console.log('Tabla cuentas_bancarias configurada correctamente.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creando tabla cuentas_bancarias:', error);
  } finally {
    client.release();
    process.exit(0);
  }
}

createTable();
