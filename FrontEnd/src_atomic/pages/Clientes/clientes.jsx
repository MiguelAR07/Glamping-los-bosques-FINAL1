import React, { useEffect } from "react";
import TablaGeneral from "../../components/organisms/tabla";
import { useFetch } from "../../hooks/useFetch";

function Clientes() {
  const { data, loading, error, fetchData } = useFetch();

  useEffect(() => {
    fetchData(`${import.meta.env.VITE_API_BASE_URL}/api/customers/security-log`);
  }, [fetchData]);

  const formatTimeOnly = (dateStr) => {
    if (!dateStr) return "N / A";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "N / A";
      return new Intl.DateTimeFormat("es-CO", { hour: "2-digit", minute: "2-digit", hour12: true }).format(d);
    } catch(e) { return "N / A"; }
  };
  
  const formatDateOnly = (dateStr) => {
    if (!dateStr) return "N / A";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "N / A";
      return new Intl.DateTimeFormat("es-CO", { day: "2-digit", month: "2-digit", year: "numeric" }).format(d);
    } catch(e) { return "N / A"; }
  };

  const mappedData = data && Array.isArray(data) ? data.map(r => ({
    ...r,
    "Cliente": r["Cliente"],
    "Identificación": r["Identificación"],
    "Contacto": r["Contacto"],
    "Correo": r["Correo"],
    "Cabaña": r["Cabaña"],
    "Fecha Entrada": formatDateOnly(r["Fecha de Entrada"]),
    "Hora Entrada": formatTimeOnly(r["Fecha de Entrada"]),
    "Fecha Salida": formatDateOnly(r["Fecha de Salida"]),
    "Hora Salida": formatTimeOnly(r["Fecha de Salida"])
  })) : null;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', marginTop: '20px' }}>
        <h2 style={{ color: '#555', margin: 0 }}>Registro de Seguridad de Clientes</h2>
      </div>
      
      {loading && <p style={{ marginTop: '20px' }}>Cargando registro...</p>}
      {error && <p style={{ marginTop: '20px', color: 'red' }}>Error: {error}</p>}
      
      {mappedData && (
        <TablaGeneral
          data={mappedData}
          hiddenColumns={['id', 'Fecha de Entrada', 'Fecha de Salida']}
          columnMapping={{}}
        />
      )}
    </>
  );
}

export default Clientes;
