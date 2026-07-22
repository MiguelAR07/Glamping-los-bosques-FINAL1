import pool from './src/config/db.js';

async function restoreRoble() {
  const packages = [
    { id: 22, cabana_id: 3, tipo_id: 7, nombre: 'Paquete Día de Sol', dias: 1, desc: 'Paquete Día de Sol para Cabaña Roble.', estado: 'Activo', promo: 0 },
    { id: 21, cabana_id: 3, tipo_id: 6, nombre: 'Paquete Ocasional', dias: 0, desc: 'Plan Ocasional de 6 horas.', estado: 'Activo', promo: 0 },
    { id: 19, cabana_id: 3, tipo_id: 4, nombre: 'Paquete Fin de Semana / Festivo', dias: 1, desc: 'Paquete Fin de Semana / Festivo para Cabaña Roble.', estado: 'Activo', promo: 0 },
    { id: 20, cabana_id: 3, tipo_id: 5, nombre: 'Paquete Semana (L - V)', dias: 1, desc: 'Paquete Semana (L - V) para Cabaña Roble.', estado: 'Activo', promo: 0 },
    { id: 25, cabana_id: 3, tipo_id: 8, nombre: 'Paquete Ocasional Fin de Semana', dias: 0, desc: 'Plan Ocasional de 6 horas para fin de semana.', estado: 'Activo', promo: 0 },
    { id: 28, cabana_id: 3, tipo_id: 4, nombre: 'Reserva - Cabaña Roble', dias: 1, desc: 'Paquete Cabaña Roble - Plan Fin de Semana / Festivo', estado: 'Activo', promo: 0 }
  ];

  try {
    for (const p of packages) {
      // Check if it exists by cabana_id and tipo_id
      const check = await pool.query('SELECT * FROM paquetes WHERE cabana_id = $1 AND tipo_id = $2', [p.cabana_id, p.tipo_id]);
      if (check.rows.length === 0) {
        await pool.query(`
          INSERT INTO paquetes (cabana_id, tipo_id, nombre, dias_estadia, descripcion, fecha_registro, estado, precio_promocional)
          VALUES ($1, $2, $3, $4, $5, NOW(), $6, $7)
        `, [p.cabana_id, p.tipo_id, p.nombre, p.dias, p.desc, p.estado, p.promo]);
        console.log("Restaurado: " + p.nombre);
      } else {
        console.log("Ya existe: " + p.nombre);
      }
    }
  } catch(e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}

restoreRoble();
