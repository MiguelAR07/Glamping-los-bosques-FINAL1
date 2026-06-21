import "dotenv/config";
import pool from "./src/config/db.js";
import bcrypt from "bcrypt";

async function reset() {
  try {
    const password = "admin";
    const hashed = await bcrypt.hash(password, 10);
    await pool.query("UPDATE login SET contrasena = $1 WHERE email = $2", [hashed, "panelglampinglosbosques@gmail.com"]);
    console.log("Password reset to: admin");
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

reset();
