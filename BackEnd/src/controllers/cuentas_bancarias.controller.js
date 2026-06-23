import pool from '../config/db.js';

// Obtener todas las cuentas bancarias (panel de control)
export const getCuentasBancarias = async (req, res) => {
  try {
    const query = `
      SELECT id, banco, tipo_cuenta, numero_cuenta, titular, estado
      FROM cuentas_bancarias
      ORDER BY id ASC
    `;
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener cuentas bancarias:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Crear una nueva cuenta bancaria
export const createCuentaBancaria = async (req, res) => {
  const { banco, tipo_cuenta, numero_cuenta, titular, estado } = req.body;
  try {
    const query = `
      INSERT INTO cuentas_bancarias (banco, tipo_cuenta, numero_cuenta, titular, estado)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [banco, tipo_cuenta, numero_cuenta, titular, estado ?? true];
    const { rows } = await pool.query(query, values);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error al crear cuenta bancaria:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Actualizar una cuenta bancaria
export const updateCuentaBancaria = async (req, res) => {
  const { id } = req.params;
  const { banco, tipo_cuenta, numero_cuenta, titular, estado } = req.body;
  try {
    const query = `
      UPDATE cuentas_bancarias
      SET banco = $1, tipo_cuenta = $2, numero_cuenta = $3, titular = $4, estado = $5
      WHERE id = $6
      RETURNING *
    `;
    const values = [banco, tipo_cuenta, numero_cuenta, titular, estado, id];
    const { rows } = await pool.query(query, values);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Cuenta bancaria no encontrada' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error al actualizar cuenta bancaria:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Eliminar (o desactivar) una cuenta bancaria
export const deleteCuentaBancaria = async (req, res) => {
  const { id } = req.params;
  try {
    const query = `
      DELETE FROM cuentas_bancarias
      WHERE id = $1
      RETURNING *
    `;
    const { rows } = await pool.query(query, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Cuenta bancaria no encontrada' });
    }
    
    res.json({ message: 'Cuenta bancaria eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar cuenta bancaria:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
