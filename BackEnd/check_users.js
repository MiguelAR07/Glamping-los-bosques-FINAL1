import pg from 'pg';
import bcrypt from 'bcrypt';

const { Pool } = pg;
const pool = new Pool({
  connectionString: 'postgresql://postgres.pxzhqxrdajlcahkvadsj:GlampingDB2026@aws-1-us-east-1.pooler.supabase.com:6543/postgres'
});

async function checkAndFix() {
  try {
    const res = await pool.query('SELECT * FROM login');
    console.log("Login BD:", res.rows);
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    if (res.rows.length > 0) {
      await pool.query('UPDATE login SET contrasena = $1 WHERE email = $2', [hashedPassword, res.rows[0].email]);
      console.log(`Password reset to admin123 for ${res.rows[0].email}`);
    } else {
      console.log("No logins found!");
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    pool.end();
  }
}
checkAndFix();
