export const termsModel = {
  getTerms: `
    SELECT 
      id,
      titulo,
      contenido,
      categoria,
      orden,
      fecha_actualizacion
    FROM terminos_condiciones
    ORDER BY orden ASC, id ASC
  `,
  getTermById: `
    SELECT 
      id,
      titulo,
      contenido,
      categoria,
      orden,
      fecha_actualizacion
    FROM terminos_condiciones
    WHERE id = $1
  `,
  createTerm: `
    INSERT INTO terminos_condiciones (titulo, contenido, categoria, orden, fecha_actualizacion)
    VALUES ($1, $2, COALESCE($3, 'General'), COALESCE($4, 1), CURRENT_TIMESTAMP)
    RETURNING *
  `,
  updateTerm: `
    UPDATE terminos_condiciones
    SET 
      titulo = COALESCE($1, titulo),
      contenido = COALESCE($2, contenido),
      categoria = COALESCE($3, categoria),
      orden = COALESCE($4, orden),
      fecha_actualizacion = CURRENT_TIMESTAMP
    WHERE id = $5
    RETURNING *
  `,
  deleteTerm: `
    DELETE FROM terminos_condiciones
    WHERE id = $1
    RETURNING *
  `
};
