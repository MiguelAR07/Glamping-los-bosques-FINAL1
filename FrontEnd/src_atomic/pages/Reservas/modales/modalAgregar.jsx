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
  const [isOcasional, setIsOcasional] = useState(false);
  const [horasReserva, setHorasReserva] = useState({ entrada: '15:00', salida: '13:00' });

  const [formData, setFormData] = useState({
    cliente: {
      nombre: '', email: '', contacto: '', tipo_identificacion: 'CC', numero_identificacion: '', pais_residencia: 'Colombia'
    },
    reserva: {
      llegada: initialDates?.start ? new Date(initialDates.start).toISOString().split('T')[0] : '', 
      salida: initialDates?.end ? new Date(initialDates.end).toISOString().split('T')[0] : '', 
      por_pagar: 0, paquete_id: ''
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
  }, []);

  const handleChange = (section, field, value) => {
    if (section === 'reserva' && field === 'paquete_id') {
      const selectedPkg = paquetes.find(p => p.id === parseInt(value) || p.paquete_id === parseInt(value));
      if (selectedPkg && selectedPkg.tipo) {
        const tipoLower = selectedPkg.tipo.toLowerCase();
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
        setIsOcasional(false);
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

      // Auto-calcular días de estadía si cambian las fechas
      if (section === 'reserva' && (field === 'llegada' || field === 'salida')) {
        const start = newForm.reserva.llegada;
        const end = newForm.reserva.salida;
        if (start && end) {
          const startDate = new Date(start);
          const endDate = new Date(end);
          const diffTime = endDate - startDate;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays > 0) {
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

      const data = await response.json();

      if (response.ok) {
        Swal.fire({ icon: 'success', title: 'Éxito', text: 'Reserva creada exitosamente y correo enviado al cliente.' });
        fetchData();
        setModalAbierto(false);
      } else {
        Swal.fire({ icon: 'error', title: 'Error', text: `Error al crear la reserva: ${data.error || data.message || 'Error desconocido'}` });
      }
    } catch (error) {
      console.error(error);
      Swal.fire({ icon: 'error', title: 'Error de conexión', text: 'Ocurrió un error al procesar la solicitud (revisa la consola para más detalles).' });
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
            // Opcional: limpiar el paquete si cambian de cabaña
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
          <label>Paquete Asignado</label>
          <select required value={formData.reserva.paquete_id} onChange={(e) => handleChange('reserva', 'paquete_id', e.target.value)} disabled={!selectedCabana}>
            <option value="">Seleccione un paquete</option>
            {paquetes
              .filter(p => !selectedCabana || p.cabana_id === parseInt(selectedCabana) || p.cabana_id == selectedCabana)
              .filter((p, index, self) => index === self.findIndex((t) => t.tipo === p.tipo && (t.cabana_id === p.cabana_id)))
              .map(p => (
                <option key={p.paquete_id || p.id} value={p.paquete_id || p.id}>
                  {p.cabana_nombre || 'Cabaña'} - {p.tipo || 'Paquete'} ({p.dias || 1} días)
                </option>
            ))}
          </select>
        </FormGroup>

        <FormGroup>
          <label>Fecha de Llegada</label>
          <input required type="date" value={formData.reserva.llegada} onChange={(e) => handleChange('reserva', 'llegada', e.target.value)} />
        </FormGroup>
        
        <FormGroup>
          <label>Fecha de Salida</label>
          <input required type="date" value={formData.reserva.salida} onChange={(e) => handleChange('reserva', 'salida', e.target.value)} />
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