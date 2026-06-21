import "dotenv/config";
import pool from "./src/config/db.js";

async function run() {
  try {
    const res = await pool.query("SELECT * FROM login;");
    console.log("Logins:", res.rows);
    const res2 = await pool.query("SELECT * FROM usuarios;");
    console.log("Usuarios:", res2.rows);
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

run();
