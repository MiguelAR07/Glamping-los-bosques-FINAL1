import pool from './src/config/db.js';
async function check() {
    try {
        const res = await pool.query('SELECT * FROM vista_reservas LIMIT 1');
        console.log('Columns in vista_reservas:', Object.keys(res.rows[0] || {}));
        console.log('Sample row:', res.rows[0]);
    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}
check();
