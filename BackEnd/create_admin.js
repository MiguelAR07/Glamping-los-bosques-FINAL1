import pg from 'pg';
import bcrypt from 'bcrypt';

const { Pool } = pg;

const pool = new Pool({
  connectionString: 'postgresql://postgres:GlampingDB2026@db.pxzhqxrdajlcahkvadsj.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function createAdmin() {
  try {
    const client = await pool.connect();
    
    // 1. Insertar roles si no existen
    await client.query(`
      INSERT INTO Roles (Rol_ID, Nombre) VALUES 
      (1, 'Administrador'), (2, 'Recepcionista'), (3, 'Mantenimiento')
      ON CONFLICT (Rol_ID) DO NOTHING;
    `);

    // 2. Insertar Usuario
    await client.query(`
      INSERT INTO Usuarios (Usuario_ID, Rol_ID, tipo_identificacion, numero_identificacion, Nombre, Contacto, Sueldo, Fecha_Agregado)
      VALUES (1, 1, 'CC', '123456789', 'Administrador Principal', '3000000000', 0, CURRENT_TIMESTAMP)
      ON CONFLICT (numero_identificacion) DO NOTHING;
    `);

    // 3. Insertar Login
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await client.query(`
      INSERT INTO Login (Usuario_ID, Email, Contrasena, Estado)
      VALUES (1, 'panelglampinglosbosques@gmail.com', $1, 'Activo')
      ON CONFLICT (Email) DO UPDATE SET Contrasena = $1;
    `, [hashedPassword]);

    console.log("✅ Administrador creado exitosamente.");
    client.release();
  } catch (error) {
    console.error("Error creando admin:", error);
  } finally {
    pool.end();
  }
}

createAdmin();
