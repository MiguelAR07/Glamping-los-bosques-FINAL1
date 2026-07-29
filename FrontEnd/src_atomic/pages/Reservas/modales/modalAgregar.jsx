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

  textarea {
    resize: vertical;
    min-height: 80px;
  }
`;

const FullWidthGroup = styled(FormGroup)`
  grid-column: 1 / -1;
`;

const PaqueteResumen = styled.div`
  grid-column: 1 / -1;
  background: linear-gradient(135deg, #f0f7ec 0%, #e8f5e1 100%);
  border: 1px solid #c5d8b8;
  border-radius: 10px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  animation: fadeIn 0.3s ease;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-5px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .icono {
    background: #43523A;
    color: white;
    width: 44px;
    height: 44px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.4em;
    flex-shrink: 0;
  }

  .info {
    flex: 1;
    h4 {
      margin: 0 0 4px 0;
      color: #2c3825;
      font-size: 1em;
    }
    p {
      margin: 0;
      color: #5a6b4f;
      font-size: 0.85em;
    }
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

export default function ModalAgregar({ setModalAbierto, fetchData, initialDates }) {
  const [loading, setLoading] = useState(false);
  const [paquetes, setPaquetes] = useState([]);
  const [cabanas, setCabanas] = useState([]);
  const [selectedCabana, setSelectedCabana] = useState('');
  const [selectedPaquete, setSelectedPaquete] = useState(null);
  const [todosLosServicios, setTodosLosServicios] = useState([]);
  const [serviciosPaqueteIds, setServiciosPaqueteIds] = useState(new Set());
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState([]);
  const [loadingServicios, setLoadingServicios] = useState(false);
  const [isOcasional, setIsOcasional] = useState(false);
  const [isFinSemana, setIsFinSemana] = useState(false);
  const [horasReserva, setHorasReserva] = useState({ entrada: '15:00', salida: '13:00' });

  const [formData, setFormData] = useState({
    cliente: {
      nombre: '', email: '', contacto: '', tipo_identificacion: 'CC', numero_identificacion: '', pais_residencia: 'Colombia'
    },
    reserva: {
      llegada: initialDates?.start ? new Date(initialDates.start).toISOString().split('T')[0] : '', 
      salida: initialDates?.end ? new Date(initialDates.end).toISOString().split('T')[0] : '', 
      por_pagar: 0, paquete_id: '',
      adultos: 2, ninos: 0, mascotas: 0
    },
    factura: {
      subtotal: 0, descuento: 0
    }
  });
  
  const [comprobanteFile, setComprobanteFile] = useState(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/packages`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setPaquetes(data.filter(p => p.estado?.toLowerCase() === 'activo'));
        } else if (data && data.success && Array.isArray(data.data)) {
          setPaquetes(data.data.filter(p => p.estado?.toLowerCase() === 'activo'));
        }
      })
      .catch(err => console.error("Error cargando paquetes", err));

    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/cabins`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCabanas(data.filter(c => c.estado?.toLowerCase() === 'activo' || c.estado?.toLowerCase() === 'mantenimiento'));
        } else if (data && data.success && Array.isArray(data.data)) {
          setCabanas(data.data.filter(c => c.estado?.toLowerCase() === 'activo' || c.estado?.toLowerCase() === 'mantenimiento'));
        }
      })
      .catch(err => console.error("Error cargando cabañas", err));

    // Cargar todos los servicios disponibles en el sistema
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/services`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setTodosLosServicios(data.filter(s => s.estado?.toLowerCase() === 'activo' || !s.estado));
        }
      })
      .catch(err => console.error("Error cargando lista de servicios", err));
  }, []);

  // Cargar servicios del paquete seleccionado y pre-seleccionarlos
  useEffect(() => {
    if (!selectedPaquete) {
      setServiciosPaqueteIds(new Set());
      return;
    }
    const paqueteId = selectedPaquete.paquete_id || selectedPaquete.id;
    if (!paqueteId) return;

    setLoadingServicios(true);
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/packages/${paqueteId}/services`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const pkgServiceIds = new Set(data.map(s => Number(s.servicio_id || s.id)));
          setServiciosPaqueteIds(pkgServiceIds);
          // Pre-seleccionar los servicios del paquete que aún no estén seleccionados
          setServiciosSeleccionados(prev => {
            const combined = new Set([...prev, ...pkgServiceIds]);
            return Array.from(combined);
          });
        }
      })
      .catch(err => console.error("Error cargando servicios del paquete", err))
      .finally(() => setLoadingServicios(false));
  }, [selectedPaquete]);

  const toggleServicio = (servicioId) => {
    setServiciosSeleccionados(prev => {
      if (prev.includes(servicioId)) {
        return prev.filter(id => id !== servicioId);
      } else {
        return [...prev, servicioId];
      }
    });
  };

  const paquetesFiltrados = paquetes
    .filter(p => !selectedCabana || p.cabana_id === parseInt(selectedCabana) || p.cabana_id == selectedCabana)
    .filter((p, index, self) => index === self.findIndex((t) => t.tipo === p.tipo && (t.cabana_id === p.cabana_id)));

  const handleChange = (section, field, value) => {
    if (section === 'reserva' && field === 'paquete_id') {
      const selectedPkg = paquetes.find(p => p.id === parseInt(value) || p.paquete_id === parseInt(value));
      setSelectedPaquete(selectedPkg || null);
      if (selectedPkg && selectedPkg.tipo) {
        const tipoLower = selectedPkg.tipo.toLowerCase();
        setIsFinSemana(tipoLower.includes('fin de semana') || tipoLower.includes('fin semana'));
        
        if (tipoLower.includes('ocasional')) {
          setIsOcasional(true);
          setHorasReserva({ entrada: '08:00', salida: '14:00' });
        } else if (tipoLower.includes('sol')) {
          setIsOcasional(true);
          setHorasReserva({ entrada: '10:00', salida: '17:00' });
        } else {
          setIsOcasional(false);
          setHorasReserva({ entrada: '15:00', salida: '13:00' });
        }
      } else {
        setSelectedPaquete(null);
        setIsOcasional(false);
        setIsFinSemana(false);
        setHorasReserva({ entrada: '15:00', salida: '13:00' });
      }
    }

    setFormData(prev => {
      const newForm = {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      };

      if (section === 'reserva' && field === 'llegada') {
        if (isFinSemana) {
          // JS getUTCDay() => 0: Domingo, 1: Lunes, 2: Martes, 3: Miércoles, 4: Jueves, 5: Viernes, 6: Sábado
          const dateSelected = new Date(value);
          const dayOfWeek = dateSelected.getUTCDay();
          if (dayOfWeek >= 1 && dayOfWeek <= 4) { // Lunes a Jueves
            Swal.fire({ icon: 'warning', title: 'Atención', text: 'El plan de fin de semana solo aplica para viernes, sábado y domingo.' });
            newForm.reserva.llegada = '';
            return newForm;
          }
        }
      }

      // Auto-calcular días de estadía si cambian las fechas
      if (section === 'reserva' && (field === 'llegada' || field === 'salida')) {
        let start = newForm.reserva.llegada;
        let end = newForm.reserva.salida;
        
        // Auto-llenado ocasional/sol
        if (field === 'llegada' && isOcasional) {
          end = value;
          newForm.reserva.salida = value;
        }

        if (start && end) {
          const startDate = new Date(start);
          const endDate = new Date(end);
          const diffTime = endDate - startDate;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays >= 0) { // Permitir 0 días para ocasional
            newForm.reserva.dias_estadia = diffDays;
          }
        }
      }

      return newForm;
    });
  };

  const handleFileChange = (e) => {
    if(e.target.files && e.target.files[0]) {
      setComprobanteFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const arr = new Date(formData.reserva.llegada);
    const dep = new Date(formData.reserva.salida);

    if (isNaN(arr) || isNaN(dep)) {
      Swal.fire({ icon: 'warning', title: 'Campos incompletos', text: 'Por favor, selecciona fechas válidas de llegada y salida.' });
      setLoading(false);
      return;
    }

    // Validar fechas: para planes ocasionales y día de sol, el mismo día es válido
    if (isOcasional) {
      if (arr > dep) {
        Swal.fire({ icon: 'warning', title: 'Atención', text: 'La fecha de salida no puede ser anterior a la fecha de llegada.' });
        setLoading(false);
        return;
      }
    } else {
      if (arr >= dep) {
        Swal.fire({ icon: 'warning', title: 'Atención', text: 'La fecha de salida debe ser posterior a la fecha de llegada.' });
        setLoading(false);
        return;
      }
    }

    try {
      const token = localStorage.getItem("token");
      const submitData = new FormData();
      
      const clienteFinal = {
        ...formData.cliente,
        numero_identificacion: formData.cliente.numero_identificacion || `RES-${Date.now()}`,
        email: formData.cliente.email || 'no-reply@glamping.com'
      };
      
      submitData.append("cliente", JSON.stringify(clienteFinal));
      
      // Ajustar fechas a ISO usando las horas personalizadas siempre
      const reservaCopy = { ...formData.reserva };
      reservaCopy.llegada = new Date(`${reservaCopy.llegada}T${horasReserva.entrada}:00`).toISOString();
      reservaCopy.salida = new Date(`${reservaCopy.salida}T${horasReserva.salida}:00`).toISOString();
      submitData.append("reserva", JSON.stringify(reservaCopy));
      
      submitData.append("factura", JSON.stringify(formData.factura));
      
      const serviciosPayload = serviciosSeleccionados.map(id => ({ servicio_id: id }));
      submitData.append("servicios", JSON.stringify(serviciosPayload));

      if (comprobanteFile) {
        submitData.append("comprobante", comprobanteFile);
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/reservations`, {
        method: 'POST',
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: submitData
      });

      let data;
      try {
        const text = await response.text();
        try {
          data = JSON.parse(text);
        } catch (jsonError) {
          console.error("RAW RESPONSE ERROR:", response.status, text);
          throw new Error(`Servidor devolvió formato inválido. Código: ${response.status}. (Ver consola)`);
        }
      } catch (e) {
        throw new Error(e.message || 'Error al leer la respuesta del servidor.');
      }

      if (response.ok) {
        Swal.fire({ icon: 'success', title: 'Éxito', text: 'Reserva creada exitosamente y correo enviado al cliente.' });
        fetchData();
        window.dispatchEvent(new Event('forceNotificationCheck'));
        setModalAbierto(false);
      } else {
        Swal.fire({ icon: 'error', title: 'Error', text: `Error al crear la reserva: ${data?.error || data?.message || 'Error desconocido'}` });
      }
    } catch (error) {
      console.error(error);
      Swal.fire({ icon: 'error', title: 'Error de conexión', text: error.message || 'Ocurrió un error al procesar la solicitud (revisa la consola para más detalles).' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalPlantilla modulo="Crear Reserva" width="800px" height="90vh" onClose={() => setModalAbierto(false)}>
      <FormGrid onSubmit={handleSubmit}>
        <h3>Datos del Cliente</h3>
        <FormGroup>
          <label>Nombre Completo</label>
          <input required type="text" placeholder="Ej: Juan Pérez" value={formData.cliente.nombre} onChange={(e) => handleChange('cliente', 'nombre', e.target.value)} />
        </FormGroup>
        <FormGroup>
          <label>Teléfono (WhatsApp)</label>
          <input required type="text" placeholder="Ej: 3001234567" value={formData.cliente.contacto} onChange={(e) => handleChange('cliente', 'contacto', e.target.value)} />
        </FormGroup>
        <FormGroup>
          <label>Documento de Identidad (Opcional)</label>
          <input type="text" placeholder="Se generará uno si se deja en blanco" value={formData.cliente.numero_identificacion} onChange={(e) => handleChange('cliente', 'numero_identificacion', e.target.value)} />
        </FormGroup>
        <FormGroup>
          <label>Email (Opcional)</label>
          <input type="email" placeholder="Ej: cliente@correo.com" value={formData.cliente.email} onChange={(e) => handleChange('cliente', 'email', e.target.value)} />
        </FormGroup>

        <h3>Datos de la Estadía</h3>
        <FormGroup>
          <label>Cabaña</label>
          <select required value={selectedCabana} onChange={(e) => {
            setSelectedCabana(e.target.value);
            setSelectedPaquete(null);
            setServiciosPaqueteIds(new Set());
            setServiciosSeleccionados([]);
            handleChange('reserva', 'paquete_id', '');
          }}>
            <option value="">Seleccione una cabaña</option>
            {cabanas.map(c => (
              <option key={c.cabana_id || c.id} value={c.cabana_id || c.id}>
                {c.nombre} (Capacidad: {c.capacidad_personas || c.capacidad || 'N/A'})
              </option>
            ))}
          </select>
        </FormGroup>

        <FormGroup>
          <label>Paquete / Plan</label>
          <select required value={formData.reserva.paquete_id} onChange={(e) => handleChange('reserva', 'paquete_id', e.target.value)} disabled={!selectedCabana}>
            <option value="">{!selectedCabana ? '⬆ Primero seleccione una cabaña' : paquetesFiltrados.length === 0 ? 'No hay paquetes para esta cabaña' : 'Seleccione un paquete'}</option>
            {paquetesFiltrados.map(p => (
                <option key={p.paquete_id || p.id} value={p.paquete_id || p.id}>
                  {p.tipo || 'Paquete'} — {p.dias || 1} {(p.dias || 1) === 1 ? 'día' : 'días'}
                </option>
            ))}
          </select>
        </FormGroup>

        {selectedPaquete && (
          <PaqueteResumen>
            <div className="icono">📦</div>
            <div className="info">
              <h4>{selectedPaquete.tipo || 'Paquete'}</h4>
              <p>
                {cabanas.find(c => (c.cabana_id || c.id) == selectedCabana)?.nombre || 'Cabaña'} · {selectedPaquete.dias || 1} {(selectedPaquete.dias || 1) === 1 ? 'día' : 'días'} de estadía
                {selectedPaquete.descripcion && selectedPaquete.descripcion !== 'Sin descripcion' ? ` · ${selectedPaquete.descripcion}` : ''}
              </p>
            </div>
          </PaqueteResumen>
        )}

        <h3>Servicios Otorgados a la Reserva</h3>
        <ServiciosGrid>
          {loadingServicios ? (
            <p className="no-servicios">Cargando servicios del paquete...</p>
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
                      <span className="badge-paquete">✓ En Paquete</span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="no-servicios">No hay servicios registrados en el sistema.</p>
          )}
        </ServiciosGrid>

        <FormGroup>
          <label>Fecha de Llegada</label>
          <input required type="date" value={formData.reserva.llegada} onChange={(e) => handleChange('reserva', 'llegada', e.target.value)} />
        </FormGroup>
        
        <FormGroup>
          <label>Fecha de Salida</label>
          <input required type="date" min={formData.reserva.llegada} value={formData.reserva.salida} onChange={(e) => handleChange('reserva', 'salida', e.target.value)} />
        </FormGroup>

        <FormGroup>
          <label>Adultos / Personas</label>
          <input required type="number" min="1" value={formData.reserva.adultos} onChange={(e) => handleChange('reserva', 'adultos', e.target.value === '' ? '' : parseInt(e.target.value))} />
        </FormGroup>

        <FormGroup>
          <label>Niños (-3 años)</label>
          <input required type="number" min="0" value={formData.reserva.ninos} onChange={(e) => handleChange('reserva', 'ninos', e.target.value === '' ? '' : parseInt(e.target.value))} />
        </FormGroup>

        <FormGroup>
          <label>Mascotas</label>
          <input required type="number" min="0" value={formData.reserva.mascotas} onChange={(e) => handleChange('reserva', 'mascotas', e.target.value === '' ? '' : parseInt(e.target.value))} />
        </FormGroup>
        
        <FormGroup>
          <label>Hora de Entrada</label>
          <input required type="time" value={horasReserva.entrada} onChange={(e) => setHorasReserva(p => ({ ...p, entrada: e.target.value }))} />
        </FormGroup>
        
        <FormGroup>
          <label>Hora de Salida</label>
          <input required type="time" value={horasReserva.salida} onChange={(e) => setHorasReserva(p => ({ ...p, salida: e.target.value }))} />
        </FormGroup>

        <h3>Finanzas</h3>
        <FormGroup>
          <label>Valor Total (Subtotal)</label>
          <input required type="number" min="0" placeholder="Ej: 350000" value={formData.factura.subtotal} onChange={(e) => handleChange('factura', 'subtotal', e.target.value)} />
        </FormGroup>
        <FormGroup>
          <label>Valor Restante por Pagar</label>
          <input required type="number" min="0" placeholder="Ej: 175000" value={formData.reserva.por_pagar} onChange={(e) => handleChange('reserva', 'por_pagar', e.target.value)} />
        </FormGroup>
        
        <FullWidthGroup>
          <label>Comprobante de Pago (Opcional)</label>
          <input type="file" accept="image/*,.pdf" onChange={handleFileChange} />
        </FullWidthGroup>

        <BotonGuardar type="submit" disabled={loading}>
          {loading ? 'Procesando Reserva...' : 'Generar Reserva Rápida'}
        </BotonGuardar>
      </FormGrid>
    </ModalPlantilla>
  );
}