import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import ModalPlantilla from "../../../components/organisms/Modales/modalPlantilla";

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

export default function ModalAgregar({ setModalAbierto, fetchData }) {
  const [loading, setLoading] = useState(false);
  const [cabañas, setCabañas] = useState([]);
  const [tiposPaquete, setTiposPaquete] = useState([]);

  const [formData, setFormData] = useState({
    cliente: {
      nombre: '', email: '', contacto: '', tipo_identificacion: 'CC', numero_identificacion: '', pais_residencia: 'Colombia'
    },
    reserva: {
      llegada: '', salida: '', por_pagar: 0
    },
    paquete: {
      cabana_id: '', dias_estadia: 1, tipo_id: '', descripcion: 'Reserva manual creada por Admin'
    },
    factura: {
      subtotal: 0, descuento: 0
    }
  });
  
  const [comprobanteFile, setComprobanteFile] = useState(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/cabins`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCabañas(data.filter(c => c.estado?.toLowerCase() === 'activo' || c.estado?.toLowerCase() === 'mantenimiento'));
        } else if (data && data.success && Array.isArray(data.data)) {
          setCabañas(data.data.filter(c => c.estado?.toLowerCase() === 'activo' || c.estado?.toLowerCase() === 'mantenimiento'));
        }
      })
      .catch(err => console.error("Error cargando cabañas", err));

    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/packages/types`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setTiposPaquete(data);
        } else if (data.success && Array.isArray(data.data)) {
          setTiposPaquete(data.data);
        }
      })
      .catch(err => console.error("Error cargando tipos de paquete", err));
  }, []);

  const handleChange = (section, field, value) => {
    setFormData(prev => {
      const newForm = {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      };

      // Auto-calcular días de estadía
      if (section === 'reserva' && (field === 'llegada' || field === 'salida')) {
        const start = newForm.reserva.llegada;
        const end = newForm.reserva.salida;
        if (start && end) {
          const startDate = new Date(start);
          const endDate = new Date(end);
          const diffTime = endDate - startDate;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays > 0) {
            newForm.paquete.dias_estadia = diffDays;
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

    // Validar fechas
    if (new Date(formData.reserva.salida) <= new Date(formData.reserva.llegada)) {
      alert("La fecha de salida debe ser posterior a la fecha de llegada.");
      setLoading(false);
      return;
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
      
      // Ajustar fechas a ISO 
      const reservaCopy = { ...formData.reserva };
      reservaCopy.llegada = new Date(reservaCopy.llegada + "T15:00:00").toISOString();
      reservaCopy.salida = new Date(reservaCopy.salida + "T11:00:00").toISOString();
      submitData.append("reserva", JSON.stringify(reservaCopy));
      
      submitData.append("paquete", JSON.stringify(formData.paquete));
      submitData.append("factura", JSON.stringify(formData.factura));

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/reservations`, {
        method: 'POST',
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: submitData
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert("Reserva creada exitosamente y correo enviado al cliente.");
        fetchData();
        setModalAbierto(false);
      } else {
        alert(`Error al crear la reserva: ${data.message || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión al crear la reserva");
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
          <label>Cabaña Asignada</label>
          <select required value={formData.paquete.cabana_id} onChange={(e) => handleChange('paquete', 'cabana_id', e.target.value)}>
            <option value="">Seleccione una cabaña</option>
            {cabañas.map(c => (
              <option key={c.cabana_id || c.id} value={c.cabana_id || c.id}>{c.nombre} (Capacidad: {c.capacidad_personas || c.capacidad || 'N/A'})</option>
            ))}
          </select>
        </FormGroup>
        <FormGroup>
          <label>Tipo de Plan</label>
          <select required value={formData.paquete.tipo_id} onChange={(e) => handleChange('paquete', 'tipo_id', e.target.value)}>
            <option value="">Seleccione un plan</option>
            {tiposPaquete.map(t => (
              <option key={t.tipo_id || t.id} value={t.tipo_id || t.id}>{t.nombre}</option>
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

        <h3>Finanzas</h3>
        <FormGroup>
          <label>Valor Total (Subtotal)</label>
          <input required type="number" min="0" placeholder="Ej: 350000" value={formData.factura.subtotal} onChange={(e) => handleChange('factura', 'subtotal', e.target.value)} />
        </FormGroup>
        <FormGroup>
          <label>Valor Restante por Pagar</label>
          <input required type="number" min="0" placeholder="Ej: 175000" value={formData.reserva.por_pagar} onChange={(e) => handleChange('reserva', 'por_pagar', e.target.value)} />
        </FormGroup>

        <BotonGuardar type="submit" disabled={loading}>
          {loading ? 'Procesando Reserva...' : 'Generar Reserva Rápida'}
        </BotonGuardar>
      </FormGrid>
    </ModalPlantilla>
  );
}