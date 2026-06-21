export const review = {
  getReviews: `
    SELECT 
      nombre, 
      texto, 
      rating,
      fecha_creacion
    FROM Resenas
    ORDER BY fecha_creacion DESC
  `,
  createReview: `
    INSERT INTO Resenas (nombre, texto, rating)
    VALUES ($1, $2, $3)
    RETURNING nombre, texto, rating
  `
};
