import pg from 'pg';
import bcrypt from 'bcrypt';

const { Pool } = pg;
const pool = new Pool({
  connectionString: 'postgresql://postgres:GlampingDB2026@db.pxzhqxrdajlcahkvadsj.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function testLogin() {
  const email = 'panelglampinglosbosques@gmail.com';
  const contrasena = 'admin123';
  
  const result = await pool.query(`
    SELECT
      l.login_id,
      l.usuario_id,
      l.email,
      l.contrasena,
      u.nombre AS usuario_nombre,
      r.nombre AS rol_nombre
    FROM login l
    JOIN usuarios u ON l.usuario_id = u.usuario_id
    JOIN roles r ON u.rol_id = r.rol_id
    WHERE l.email = $1
  `, [email]);

  if (result.rows.length === 0) {
    console.log("Usuario no encontrado en la DB");
    const checkUser = await pool.query("SELECT * FROM login");
    console.log("Logins existentes:", checkUser.rows);
  } else {
    const usuario = result.rows[0];
    const coinciden = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!coinciden) {
      console.log("Contraseña incorrecta. Hash en DB:", usuario.contrasena);
    } else {
      console.log("Login exitoso localmente para:", usuario.usuario_nombre);
    }
  }
  pool.end();
}

testLogin();
