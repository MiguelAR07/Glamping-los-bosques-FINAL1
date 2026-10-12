import { useState, useCallback } from "react";

/**
 * Hook personalizado para manejar peticiones HTTP al backend.
 *
 * @returns {Object} Un objeto con:
 * - data: El resultado de la petición (JSON).
 * - loading: Booleano que indica si la petición está en curso.
 * - error: El error de la petición si ocurre.
 * - fetchData: Función para disparar la petición manualmente.
 */
export const useFetch = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (url, options = {}) => {
    setLoading(true);
    setError(null);

    const token = localStorage.getItem('token');

    // Configuración por defecto para JSON combinando con custom headers
    const mergedHeaders = {
      "Content-Type": "application/json",
      ...(token ? { "Authorization": `Bearer ${token}` } : {}),
      ...(options.headers || {})
    };

    const finalOptions = {
      method: "GET",
      ...options,
      headers: mergedHeaders,
    };

    try {
      const response = await fetch(url, finalOptions);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const validationMessages = Array.isArray(errorData.errors)
          ? errorData.errors.map((e) => e.message).join('\n')
          : '';
        throw new Error(errorData.message || validationMessages || `Error: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
      return result; // Útil para manejarlo en el componente inmediatamente
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, fetchData };
};
