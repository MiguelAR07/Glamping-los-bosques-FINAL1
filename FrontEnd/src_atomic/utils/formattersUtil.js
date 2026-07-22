/**
 * Formatea un número o string numérico a moneda (COP por defecto).
 * @param {number|string} amount - La cifra a formatear.
 * @returns {string} - La cifra formateada o "$ 0" si no es válida.
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return "$ 0";
  }

  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0, // Ajusta a 2 si necesitas centavos
  }).format(amount);
};

/**
 * Formatea una fecha a un estilo legible (ej: 12 de abril de 2026).
 * @param {string|Date} date - La fecha a formatear.
 * @returns {string} - La fecha formateada o "Fecha no válida".
 */
export const formatDate = (date) => {
  if (!date) return "N / A";

  try {
    const d = new Date(date);
    // Verificamos si la fecha es válida
    if (isNaN(d.getTime())) return "Fecha no válida";

    return new Intl.DateTimeFormat("es-CO", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(d);
  } catch (error) {
    console.error("Error formateando fecha:", error);
    return "Error de fecha";
  }
};

/**
 * Formatea una fecha a un estilo legible incluyendo la hora (ej: 12 de abril de 2026, 03:00 PM).
 * @param {string|Date} date - La fecha a formatear.
 * @returns {string} - La fecha formateada o "Fecha no válida".
 */
export const formatDateTime = (date) => {
  if (!date) return "N / A";

  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "Fecha no válida";

    return new Intl.DateTimeFormat("es-CO", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(d);
  } catch (error) {
    console.error("Error formateando fecha y hora:", error);
    return "Error de fecha";
  }
};