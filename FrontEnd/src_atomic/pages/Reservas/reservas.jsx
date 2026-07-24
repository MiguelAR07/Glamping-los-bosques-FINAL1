import SquareCard from "../../components/molecules/cards/squareCard";
import styled from "styled-components";
import Swal from "sweetalert2";

import { useFilters } from "../../hooks/useFilters";
import { deleteUtils } from "../../utils/deleteUtils";
import { activateUtils } from "../../utils/activateUtils";


import LinearGraph from "../../components/organisms/graphs/linearGraph";
import TablaGeneral from "../../components/organisms/tabla";
import { useFetch } from "../../hooks/fetchConnect";
import { useState, useEffect } from "react";

import 
  ReservasSearch, 
  { reservationFilterConfig } 
from "./componentsData/reservasSearch";

import ModalClientes from "./modales/modalClientes";
import ModalPaquete from "./modales/modalPaquete";
import ModalValidarReserva from "./modales/modalValidarReserva";
import ModalReprogramar from "./modales/modalReprogramar";
import ModalAgregar from "./modales/modalAgregar";

const CardsCont = styled.div`
  margin: 20px 0 40px 0;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;

  @media (max-width: 1100px) {
    grid-template-columns: repeat(1, 1fr);
  }
`;

const HeaderAcciones = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #ffffff 0%, #f8fcf8 100%);
  padding: 24px 30px;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(45, 120, 0, 0.05);
  border: 1px solid rgba(45, 120, 0, 0.1);
  margin-bottom: 30px;

  @media (max-width: 850px) {
    flex-direction: column;
    gap: 20px;
    padding: 20px;
    align-items: stretch;
  }
`;

const ModernButton = styled.button`
  background: linear-gradient(135deg, #2D7800 0%, #1a4700 100%);
  color: white;
  border: none;
  padding: 14px 28px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 15px rgba(45, 120, 0, 0.2);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(45, 120, 0, 0.3);
    background: linear-gradient(135deg, #358c00 0%, #1f5400 100%);
  }

  &:active {
    transform: translateY(0);
  }

  i {
    font-size: 1.2rem;
  }
`;

function Reservas({ modulo }) {
  const { data, loading, error, fetchData } = useFetch();
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [reservaAValidar, setReservaAValidar] = useState(null);
  const [reservaAReprogramar, setReservaAReprogramar] = useState(null);
  const [modalAgregarAbierto, setModalAgregarAbierto] = useState(false);

  const [reservas, setReservas] = useState(null);
  const { displayData, setFilterMode, fetchFilters } = useFilters(
    data,
    reservas,
    reservationFilterConfig
  );
  const [refreshStatsTrigger, setRefreshStatsTrigger] = useState(0);
  const [mostrarModalEditar, setMostrarModalEditar] = useState(false);

  const [selectedCanceladas, setSelectedCanceladas] = useState([]);
  const [selectedActivas, setSelectedActivas] = useState([]);
  const { data: statsData, fetchData: fetchStats } = useFetch();

  const handleFetchData = () => {
    setReservas(null);
    fetchData(`${import.meta.env.VITE_API_BASE_URL}/api/reservations`);
    fetchFilters();
    setRefreshStatsTrigger((prev) => prev + 1);
  }

  useEffect(() => {
    fetchData(`${import.meta.env.VITE_API_BASE_URL}/api/reservations`);
    fetchStats(`${import.meta.env.VITE_API_BASE_URL}/api/reservations/stats`);
  }, [fetchData, fetchStats, refreshStatsTrigger]);

  const handleClientClick = (fila) => {
    setSelectedClient(fila);
  };

  const handlePackageClick = (fila) => {
    setSelectedPackage(fila);
  };

  const closeMenu = () => {
    setSelectedClient(null);
    setSelectedPackage(null);
  };

  const eliminarReserva = (reserva) => {
    deleteUtils.eliminarRegistro(
      "reservations",
      reserva.id,
      "reserva de: " + reserva.cliente,
      handleFetchData,
    );
  };

  const cancelarSeleccionadas = async () => {
    const { default: Swal } = await import('sweetalert2');
    
    if (selectedActivas.length === 0) return;

    const result = await Swal.fire({
      title: '¿Cancelar reservas seleccionadas?',
      text: `Se cancelarán ${selectedActivas.length} reservas. Esto puede generar reembolsos.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'No'
    });

    if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem('token');
      
      let canceladasCount = 0;
      let erroresCount = 0;

      for (const reserva of selectedActivas) {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/reservations/delete/${reserva.id}`, {
          method: 'DELETE',
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true"
          }
        });
        if (res.ok) {
          canceladasCount++;
        } else {
          erroresCount++;
        }
      }

      Swal.fire({
        title: 'Proceso terminado',
        text: `Se cancelaron ${canceladasCount} reservas. ${erroresCount > 0 ? `Hubo errores en ${erroresCount}.` : ''}`,
        icon: erroresCount > 0 ? 'warning' : 'success',
        confirmButtonColor: '#3085d6'
      });

      setSelectedActivas([]);
      handleFetchData();
    } catch (err) {
      console.error("Error cancelando múltiples:", err);
      Swal.fire({
        title: 'Error de Conexión',
        text: 'No se pudo conectar con el servidor.',
        icon: 'error',
        confirmButtonColor: '#3085d6'
      });
    }
  };

  const eliminarReservaCanceladaDefinitivo = async (reserva) => {
    const { default: Swal } = await import('sweetalert2');
    const result = await Swal.fire({
      title: '¿Eliminar definitivamente?',
      text: `Esta acción eliminará permanentemente la reserva de "${reserva.cliente}" y no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar definitivamente',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/reservations/hard-delete/${reserva.id}`, {
        method: 'DELETE',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true"
        }
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        Swal.fire({
          title: 'Error',
          text: errData.message || 'No se pudo eliminar la reserva.',
          icon: 'error',
          confirmButtonColor: '#3085d6'
        });
        return;
      }

      Swal.fire({
        title: '¡Eliminada!',
        text: 'La reserva ha sido eliminada definitivamente.',
        icon: 'success',
        confirmButtonColor: '#3085d6'
      });

      handleFetchData();
    } catch (err) {
      console.error("Error:", err);
      Swal.fire({
        title: 'Error de Conexión',
        text: 'No se pudo conectar con el servidor.',
        icon: 'error',
        confirmButtonColor: '#3085d6'
      });
    }
  };

  const eliminarCanceladasSeleccionadas = async () => {
    const { default: Swal } = await import('sweetalert2');
    
    const isDeletingAll = selectedCanceladas.length === 0;
    
    const title = isDeletingAll ? '¿Borrar TODAS las reservas canceladas?' : '¿Borrar reservas seleccionadas?';
    const text = isDeletingAll 
      ? "Se eliminarán TODAS las reservas canceladas de forma permanente. ¡Esta acción no se puede deshacer!"
      : `Se eliminarán permanentemente las ${selectedCanceladas.length} reservas seleccionadas.`;

    const result = await Swal.fire({
      title: title,
      text: text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, borrar',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem('token');
      
      let res;
      if (isDeletingAll) {
        res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/reservations/hard-delete-all-canceled`, {
          method: 'DELETE',
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true"
          }
        });
      } else {
        const ids = selectedCanceladas.map(r => r.id || r.reserva_id);
        res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/reservations/hard-delete-multiple`, {
          method: 'DELETE',
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true"
          },
          body: JSON.stringify({ ids })
        });
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        Swal.fire({
          title: 'Error',
          text: errData.message || 'No se pudieron eliminar las reservas.',
          icon: 'error',
          confirmButtonColor: '#3085d6'
        });
        return;
      }

      const data = await res.json();

      Swal.fire({
        title: '¡Eliminadas!',
        text: data.message + ` (${data.cantidad} eliminadas)`,
        icon: 'success',
        confirmButtonColor: '#3085d6'
      });

      setSelectedCanceladas([]);
      handleFetchData();
    } catch (err) {
      console.error("Error:", err);
      Swal.fire({
        title: 'Error de Conexión',
        text: 'No se pudo conectar con el servidor.',
        icon: 'error',
        confirmButtonColor: '#3085d6'
      });
    }
  };

  const activarReserva = (reserva) => {
    activateUtils.activarRegistro(
      "reservations",
      reserva.id,
      "reserva de: " + reserva.cliente,
      handleFetchData,
    );
  };

  const verComprobante = (reserva) => {
    if (reserva.comprobante_url) {
      // Cloudinary bloquea la entrega de PDFs por defecto por seguridad.
      // Si es un PDF, cambiamos la extensión a .jpg para que Cloudinary
      // lo convierta automáticamente en una imagen visible.
      let finalUrl = reserva.comprobante_url;
      if (finalUrl.toLowerCase().endsWith('.pdf')) {
        finalUrl = finalUrl.slice(0, -4) + '.jpg';
      }
      window.open(finalUrl, "_blank");
    } else {
      Swal.fire({ icon: 'info', title: 'Información', text: 'No hay comprobante asociado a esta reserva.' });
    }
  };

  const procesarConfirmacion = async (reserva) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/reservations/confirm/${reserva.reserva_id || reserva.id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      if (response.ok) {
        Swal.fire({ icon: 'success', title: 'Confirmada', text: 'Reserva confirmada exitosamente y notificaciones enviadas.' });
        setReservaAValidar(null);
        handleFetchData();
      } else {
        const errData = await response.json();
        Swal.fire({ icon: 'error', title: 'Error', text: errData.message || 'No se pudo confirmar la reserva' });
      }
    } catch (error) {
      console.error(error);
      Swal.fire({ icon: 'error', title: 'Error de conexión', text: 'Error de conexión al confirmar la reserva.' });
    }
  };

  const procesarRechazo = async (reserva, motivo) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/reservations/reject/${reserva.reserva_id || reserva.id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ motivo })
      });
      if (response.ok) {
        Swal.fire({ icon: 'success', title: 'Rechazada', text: 'Reserva rechazada exitosamente y cliente notificado.' });
        setReservaAValidar(null);
        handleFetchData();
      } else {
        const errData = await response.json();
        Swal.fire({ icon: 'error', title: 'Error', text: errData.message || 'No se pudo rechazar la reserva' });
      }
    } catch (error) {
      console.error(error);
      Swal.fire({ icon: 'error', title: 'Error de conexión', text: 'Error de conexión al rechazar la reserva.' });
    }
  };

  const onColumnClickHandlers = {
    paquete: handlePackageClick
  };

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

  const mapReservasData = (dataArray) => {
    if (!dataArray) return [];
    return dataArray.map(r => {
      return {
        id: r.id || r.reserva_id,
        reserva_id: r.reserva_id || r.id,
        cliente_id: r.cliente_id,
        paquete_id: r.paquete_id,
        llegada: r.llegada,
        salida: r.salida,
        comprobante_url: r.comprobante_url,
        comprobante_saldo_url: r.comprobante_saldo_url,
        estado_saldo: r.estado_saldo,
        'Cliente': r.cliente,
        'Cabaña': r.cabana || r.Cabaña || 'N/A',
        'Paquete': r.paquete,
        'Fecha Entrada': formatDateOnly(r.llegada),
        'Hora Entrada': formatTimeOnly(r.llegada),
        'Fecha Salida': formatDateOnly(r.salida),
        'Hora Salida': formatTimeOnly(r.salida),
        'Servicios': r["Servicios adicionales"] && r["Servicios adicionales"].trim() !== "" ? r["Servicios adicionales"] : "Ninguno",
        'Huéspedes': `${r.adultos || 0} Adultos, ${r.ninos || 0} Niños, ${r.mascotas || 0} Mascotas`,
        'Estado': r.estado,
        'Total Restante': r["Pago restante"]
      };
    });
  };

  const hiddenColumnsList = [
    'comprobante_url', 'id', 'cliente', 'paquete', 'llegada', 'salida', 'estado', 
    'Pago restante', 'Servicios adicionales', 'fecha', 'cliente_id', 'paquete_id', 'reserva_id',
    'Celular', 'Cédula', 'adultos', 'ninos', 'mascotas', 'cabana', 'comprobante_saldo_url',
    'estado_saldo', 'recordatorio_24h_enviado', 'recordatorio', 'recordatorio_enviado'
  ];

  const [selectedIncomeCabin, setSelectedIncomeCabin] = useState('General');

  const formatCurrencyLocal = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const getIncomeTitle = () => {
    if (selectedIncomeCabin === 'General') {
      return statsData?.revenue_month ? formatCurrencyLocal(statsData.revenue_month) : '$0';
    }
    const cabinStats = statsData?.revenue_by_cabin?.find(c => c.cabana_id === parseInt(selectedIncomeCabin));
    return cabinStats ? formatCurrencyLocal(cabinStats.total) : '$0';
  };

  const dynamicCardData = [
    {
      bgColor: 'verde',
      texto: 'Reservas Confirmadas',
      titulo: statsData?.total_confirmed || '0',
    },
    {
      bgColor: '',
      texto: 'Por Validar',
      titulo: statsData?.total_pending || '0',
    },
    {
      bgColor: '',
      texto: 'Canceladas',
      titulo: statsData?.total_canceled || '0',
    },
    {
      bgColor: 'verde',
      texto: (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Ingresos del Mes</span>
          <select 
            value={selectedIncomeCabin}
            onChange={(e) => setSelectedIncomeCabin(e.target.value)}
            style={{ 
              background: 'rgba(255, 255, 255, 0.2)', 
              color: 'white', 
              border: 'none', 
              borderRadius: '6px', 
              padding: '2px 6px',
              fontSize: '0.8rem',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="General" style={{color: '#333'}}>General</option>
            {statsData?.revenue_by_cabin?.map(c => (
              <option key={c.cabana_id} value={c.cabana_id} style={{color: '#333'}}>
                {c.cabana_nombre}
              </option>
            ))}
          </select>
        </div>
      ),
      titulo: getIncomeTitle(),
    }
  ];

  return (
    <>
      <CardsCont>
        <LinearGraph data={statsData?.revenue_graph} title="Ganancias por mes" />
        <SquareCard squareData={dynamicCardData} />
      </CardsCont>
      <HeaderAcciones>
        <ReservasSearch onResult={setReservas} onFilterChange={setFilterMode} />
        <ModernButton onClick={() => setModalAgregarAbierto(true)}>
          <i className="bi bi-calendar-plus-fill"></i>
          Nueva Reserva
        </ModernButton>
      </HeaderAcciones>

      {loading && <p style={{ marginTop: '20px' }}>Cargando reservas...</p>}
      {error && <p style={{ marginTop: '20px', color: 'red' }}>Error: {error}</p>}
      {displayData && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', marginTop: '20px' }}>
            <h2 style={{ color: '#555', margin: 0 }}>Registro de Reservas Activas</h2>
            {selectedActivas.length > 0 && (
              <button 
                onClick={cancelarSeleccionadas}
                style={{
                  background: '#ffc107',
                  color: 'black',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <i className="bi bi-x-circle-fill"></i> Cancelar {selectedActivas.length} Seleccionadas
              </button>
            )}
          </div>
          <TablaGeneral
            data={mapReservasData(displayData.filter(r => !r.estado || !r.estado.toLowerCase().includes('cancelad')))}
            onColumnClick={onColumnClickHandlers}
            onActive={activarReserva}
            onDelete={eliminarReserva}
            selectable={true}
            selectedRows={selectedActivas}
            onSelectionChange={setSelectedActivas}
            hiddenColumns={hiddenColumnsList}
            columnMapping={{}}
            acciones={[
              {
                title: "Ver Cliente",
                icono: <i className="bi bi-person-lines-fill" style={{ fontSize: '1.2rem' }}></i>,
                color: "#1a4700",
                onClick: handleClientClick
              },
              {
                title: "Validar Reserva (Confirmar o Rechazar)",
                icono: <i className="bi bi-shield-check" style={{ fontSize: '1.2rem' }}></i>,
                color: "#0dcaf0",
                onClick: (fila) => setReservaAValidar(fila),
                condition: (fila) => fila.estado === 'Por validar'
              },
              {
                title: "Ver Comprobante",
                icono: <i className="bi bi-file-earmark-image" style={{ fontSize: '1.2rem' }}></i>,
                color: "#ffc107",
                onClick: verComprobante,
                condition: (fila) => fila.comprobante_url != null
              },
              {
                title: "Reprogramar Reserva",
                icono: <i className="bi bi-calendar2-event" style={{ fontSize: '1.2rem' }}></i>,
                color: "#6c757d",
                onClick: (fila) => setReservaAReprogramar(fila),
                condition: (fila) => fila.estado === 'Confirmado' || fila.estado === 'Por validar' || fila.estado === 'Confirmada'
              }
            ]}
          />

          {displayData.some(r => r.estado && r.estado.toLowerCase().includes('cancelad')) && (
            <div style={{ marginTop: '40px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '2px solid #ddd', paddingBottom: '10px' }}>
                <h2 style={{ color: '#555', margin: 0 }}>
                  Registro de Reservas Canceladas
                </h2>
                <button 
                  onClick={eliminarCanceladasSeleccionadas}
                  style={{
                    background: '#dc3545',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <i className="bi bi-trash-fill"></i> {selectedCanceladas.length > 0 ? `Borrar ${selectedCanceladas.length} Seleccionadas` : 'Borrar Todo'}
                </button>
              </div>
              <TablaGeneral
                data={mapReservasData(displayData.filter(r => r.estado && r.estado.toLowerCase().includes('cancelad')))}
                onColumnClick={onColumnClickHandlers}
                onActive={activarReserva}
                selectable={true}
                selectedRows={selectedCanceladas}
                onSelectionChange={setSelectedCanceladas}
                onDelete={eliminarReservaCanceladaDefinitivo}
                hiddenColumns={hiddenColumnsList}
                columnMapping={{}}
                acciones={[
                  {
                    title: "Ver Cliente",
                    icono: <i className="bi bi-person-lines-fill" style={{ fontSize: '1.2rem' }}></i>,
                    color: "#1a4700",
                    onClick: handleClientClick
                  },
                  {
                    title: "Ver Comprobante",
                    icono: <i className="bi bi-file-earmark-image" style={{ fontSize: '1.2rem' }}></i>,
                    color: "#ffc107",
                    onClick: verComprobante,
                    condition: (fila) => fila.comprobante_url != null
                  }
                ]}
              />
            </div>
          )}
        </>
      )}

      {selectedClient && (
        <ModalClientes
          id={selectedClient.cliente_id}
          onClose={closeMenu}
        />
      )}

      {selectedPackage && (
        <ModalPaquete
          id={selectedPackage.paquete_id}
          onClose={closeMenu}
        />
      )}

      {reservaAValidar && (
        <ModalValidarReserva
          reserva={reservaAValidar}
          onClose={() => setReservaAValidar(null)}
          onConfirm={procesarConfirmacion}
          onReject={procesarRechazo}
        />
      )}

      {reservaAReprogramar && (
        <ModalReprogramar
          reserva={reservaAReprogramar}
          onClose={() => setReservaAReprogramar(null)}
          onSuccess={handleFetchData}
        />
      )}

      {modalAgregarAbierto && (
        <ModalAgregar
          setModalAbierto={setModalAgregarAbierto}
          fetchData={handleFetchData}
        />
      )}
    </>
  );
}

export default Reservas;
