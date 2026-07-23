export const promocionModel = {
  getAll: `
    SELECT * 
    FROM vista_promociones
    ORDER BY fecha DESC
  `,
  create: `
    INSERT INTO Promociones (nombre, descripcion, precio, img_url, fecha_inicio, fecha_fin, dias_estadia)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING promocion_id
  `,
  addCabanas: `
    INSERT INTO Promociones_Cabanas (promocion_id, cabana_id)
    VALUES ($1, $2)
  `,
  update: `
    UPDATE Promociones
    SET nombre = $1, descripcion = $2, precio = $3, img_url = $4, fecha_inicio = $5, fecha_fin = $6, dias_estadia = $7
    WHERE promocion_id = $8
  `,
  clearCabanas: `
    DELETE FROM Promociones_Cabanas WHERE promocion_id = $1
  `,
  delete: `
    DELETE FROM Promociones
    WHERE promocion_id = $1
  `,
  deactivate: `
    UPDATE Promociones
    SET estado = 'Inactivo'
    WHERE promocion_id = $1
  `,
  activate: `
    UPDATE Promociones
    SET estado = 'Activo'
    WHERE promocion_id = $1
  `
};
