import 'dotenv/config';
import pool from './src/config/db.js';

async function main() {
  try {
    const cabins = [
      { id: 1, name: 'palmas' }
    ];

    for (const c of cabins) {
      const img1 = `http://localhost:3000/public/cabins/${c.name}/1.webp`;
      
      const exist = await pool.query("SELECT * FROM imagenes_cabana WHERE cabana_id = $1 AND img_url = $2", [c.id, img1]);
      if (exist.rows.length === 0) {
        console.log(`Inserting ${img1} for ${c.name}`);
        await pool.query("INSERT INTO imagenes_cabana (cabana_id, img_url, orden) VALUES ($1, $2, 0)", [c.id, img1]);
      } else {
        console.log(`Image ${img1} already exists for ${c.name}`);
      }
      
      const all = await pool.query("SELECT * FROM imagenes_cabana WHERE cabana_id = $1 ORDER BY img_url", [c.id]);
      console.log(`Images for ${c.name}:`, all.rows.map(r => r.img_url));
    }
  } catch (error) {
    console.error(error);
  } finally {
    process.exit(0);
  }
}
main();
