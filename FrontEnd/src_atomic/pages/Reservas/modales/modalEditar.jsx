import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import ModalPlantilla from "../../../components/organisms/Modales/modalPlantilla";
import Swal from 'sweetalert2';

const FormGrid = styled.form`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  max-height: 75vh;
  overflow-y: auto;
  padding: 10px 20px;

  h3 {
    grid-column: 1 / -1;
    color: #43523A;
    border-bottom: 2px solid #eee;
    padding-bottom: 5px;
    margin-top: 15px;
    margin-bottom: 5px;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;

  label {
    font-weight: bold;
    font-size: 0.9em;
    color: #555;
  }

  input, select, textarea {
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-family: inherit;
  }
`;

const ServiciosGrid = styled.div`
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: 12px;
  animation: fadeIn 0.3s ease;

  .servicio-card {
    background: white;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    padding: 12px 14px;
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    user-select: none;

    &:hover {
      border-color: #43523A;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(67, 82, 58, 0.08);
    }

    &.seleccionado {
      border-color: #43523A;
      background: #f4f8f3;
      box-shadow: 0 4px 12px rgba(67, 82, 58, 0.12);
    }

    input[type="checkbox"] {
      width: 18px;
      height: 18px;
      accent-color: #43523A;
      cursor: pointer;
    }

    .info-servicio {
      display: flex;
      flex-direction: column;
      gap: 2px;
      flex: 1;

      .nombre {
        font-weight: 700;
        color: #2c3825;
        font-size: 0.88em;
      }

      .precio {
        color: #43523A;
        font-size: 0.8em;
        font-weight: 600;
      }

      .badge-paquete {
        font-size: 0.7em;
        color: #1e7e34;
        background: #d4edda;
        padding: 2px 6px;
        border-radius: 4px;
        display: inline-block;
        width: fit-content;
        margin-top: 2px;
      }
    }
  }

  .no-servicios {
    grid-column: 1 / -1;
    color: #999;
    font-style: italic;
    font-size: 0.9em;
    padding: 10px 0;
  }
`;

const BotonGuardar = styled.button`
  grid-column: 1 / -1;
  padding: 12px;
  background-color: #43523A;
  color: white;
  border: none;
  border-radius: 5px;
  font-weight: bold;
  font-size: 1.1em;
  cursor: pointer;
  margin-top: 20px;
  margin-bottom: 20px;
  
  &:hover {
    background-color: #2c3825;
  }
  
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

export default function ModalEditarReserva({ reservaAEditar, setModalAbierto, fetchData }) {
  const [loading, setLoading] = useState(false);
  const [todosLosServicios, setTodosLosServicios] = useState([]);
  const [serviciosPaqueteIds, setServiciosPaqueteIds] = useState(new Set());
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState([]);
  const [loadingServicios, setLoadingServicios] = useState(false);

  const formatDateForInput = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '';
      return d.toISOString().split('T')[0];
    } catch (e) {
      return '';
    }
  };

  const [formData, setFormData] = useState({
    cliente_nombre: reservaAEditar.cliente || reservaAEditar.Cliente || '',
    cliente_contacto: reservaAEditar.Celular || reservaAEditar.contacto || '',
    cliente_cedula: reservaAEditar.Cédula || reservaAEditar.numero_identificacion || '',
    cliente_email: reservaAEditar.email || reservaAEditar.Email || '',

    llegada: formatDateForInput(reservaAEditar.llegada),
    salida: formatDateForInput(reservaAEditar.salida),
    adultos: reservaAEditar.adultos !== undefined ? reservaAEditar.adultos : 2,
    ninos: reservaAEditar.ninos !== undefined ? reservaAEditar.ninos : 0,
    mascotas: reservaAEditar.mascotas !== undefined ? reservaAEditar.mascotas : 0,
    estado: reservaAEditar.estado || reservaAEditar.Estado || 'Confirmada',

    por_pagar: Number(reservaAEditar['Pago restante'] !== undefined ? reservaAEditar['Pago restante'] : (reservaAEditar.por_pagar || 0)) || 0,
    subtotal: Number(reservaAEditar.subtotal || 0) || 0,
    descuento: Number(reservaAEditar.descuento || 0) || 0
  });

  // Cargar todos los servicios disponibles
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/services`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setTodosLosServicios(data.filter(s => s.estado?.toLowerCase() === 'activo' || !s.estado));
        }
      })
      .catch(err => console.error("Error cargando lista de servicios", err));

    // Cargar servicios actuales de la reserva
    const paqueteId = reservaAEditar.paquete_id;
    if (paqueteId) {
      setLoadingServicios(true);
      fetch(`${import.meta.env.VITE_API_BASE_URL}/api/packages/${paqueteId}/services`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            const pkgServiceIds = new Set(data.map(s => Number(s.servicio_id || s.id)));
            setServiciosPaqueteIds(pkgServiceIds);
            setServiciosSeleccionados(Array.from(pkgServiceIds));
          }
        })
        .catch(err => console.error("Error cargando servicios de la reserva", err))
        .finally(() => setLoadingServicios(false));
    }
  }, [reservaAEditar]);

  const toggleServicio = (servicioId) => {
    setServiciosSeleccionados(prev => {
      if (prev.includes(servicioId)) {
        return prev.filter(id => id !== servicioId);
      } else {
        return [...prev, servicioId];
      }
    });
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const idReserva = reservaAEditar.reserva_id || reservaAEditar.id;

      const payload = {
        ...formData,
        servicios: serviciosSeleccionados.map(id => ({ servicio_id: id }))
      };

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/reservations/update/${idReserva}`, {
        method: 'PUT',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        setModalAbierto(false);
        if (typeof fetchData === 'function') {
          fetchData();
        }
        Swal.fire({ icon: 'success', title: 'Éxito', text: 'Reserva actualizada correctamente.' });
      } else {
        Swal.fire({ icon: 'error', title: 'Error', text: data.message || 'Error al actualizar la reserva.' });
      }
    } catch (error) {
      console.error(error);
      Swal.fire({ icon: 'error', title: 'Error de conexión', text: error.message || 'Error al conectar con el servidor.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalPlantilla modulo="Editar Reserva" width="800px" height="90vh" onClose={() => setModalAbierto(false)}>
      <FormGrid onSubmit={handleSubmit}>
        <h3>Datos del Cliente</h3>
        <FormGroup>
          <label>Nombre Completo</label>
          <input required type="text" value={formData.cliente_nombre} onChange={(e) => handleChange('cliente_nombre', e.target.value)} />
        </FormGroup>
        <FormGroup>
          <label>Teléfono (WhatsApp)</label>
          <input required type="text" value={formData.cliente_contacto} onChange={(e) => handleChange('cliente_contacto', e.target.value)} />
        </FormGroup>
        <FormGroup>
          <label>Documento de Identidad (Cédula)</label>
          <input type="text" value={formData.cliente_cedula} onChange={(e) => handleChange('cliente_cedula', e.target.value)} />
        </FormGroup>
        <FormGroup>
          <label>Email</label>
          <input type="email" value={formData.cliente_email} onChange={(e) => handleChange('cliente_email', e.target.value)} />
        </FormGroup>

        <h3>Datos de la Estadía</h3>
        <FormGroup>
          <label>Fecha de Llegada</label>
          <input required type="date" value={formData.llegada} onChange={(e) => handleChange('llegada', e.target.value)} />
        </FormGroup>
        <FormGroup>
          <label>Fecha de Salida</label>
          <input required type="date" value={formData.salida} onChange={(e) => handleChange('salida', e.target.value)} />
        </FormGroup>
        <FormGroup>
          <label>Adultos</label>
          <input required type="number" min="1" value={formData.adultos} onChange={(e) => handleChange('adultos', parseInt(e.target.value) || 0)} />
        </FormGroup>
        <FormGroup>
          <label>Niños (-3 años)</label>
          <input required type="number" min="0" value={formData.ninos} onChange={(e) => handleChange('ninos', parseInt(e.target.value) || 0)} />
        </FormGroup>
        <FormGroup>
          <label>Mascotas</label>
          <input required type="number" min="0" value={formData.mascotas} onChange={(e) => handleChange('mascotas', parseInt(e.target.value) || 0)} />
        </FormGroup>

        <h3>Servicios Otorgados a la Reserva</h3>
        <ServiciosGrid>
          {loadingServicios ? (
            <p className="no-servicios">Cargando servicios de la reserva...</p>
          ) : todosLosServicios.length > 0 ? (
            todosLosServicios.map((s) => {
              const servicioId = Number(s.id || s.servicio_id);
              const isSelected = serviciosSeleccionados.includes(servicioId);
              const isFromPackage = serviciosPaqueteIds.has(servicioId);

              return (
                <div
                  key={servicioId}
                  className={`servicio-card ${isSelected ? 'seleccionado' : ''}`}
                  onClick={() => toggleServicio(servicioId)}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                  />
                  <div className="info-servicio">
                    <span className="nombre">{s.servicio || s.nombre || 'Servicio'}</span>
                    {s.precio && Number(s.precio) > 0 && (
                      <span className="precio">${Number(s.precio).toLocaleString('es-CO')}</span>
                    )}
                    {isFromPackage && (
                      <span className="badge-paquete">✓ Asignado</span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="no-servicios">No hay servicios registrados en el sistema.</p>
          )}
        </ServiciosGrid>

        <h3>Estado y Finanzas</h3>
        <FormGroup>
          <label>Estado de la Reserva</label>
          <select value={formData.estado} onChange={(e) => handleChange('estado', e.target.value)}>
            <option value="Confirmada">Confirmada</option>
            <option value="Por validar">Por validar</option>
            <option value="Pagado">Pagado</option>
            <option value="Completado">Completado</option>
            <option value="Cancelada">Cancelada</option>
          </select>
        </FormGroup>
        <FormGroup>
          <label>Valor Restante por Pagar ($)</label>
          <input required type="number" min="0" value={formData.por_pagar} onChange={(e) => handleChange('por_pagar', e.target.value)} />
        </FormGroup>

        <BotonGuardar type="submit" disabled={loading}>
          {loading ? 'Guardando Cambios...' : 'Guardar Cambios de Reserva'}
        </BotonGuardar>
      </FormGrid>
    </ModalPlantilla>
  );
}
