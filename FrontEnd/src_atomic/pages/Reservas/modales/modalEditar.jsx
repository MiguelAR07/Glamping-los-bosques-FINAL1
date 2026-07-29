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

    por_pagar: reservaAEditar['Pago restante'] !== undefined ? reservaAEditar['Pago restante'] : (reservaAEditar.por_pagar || 0),
    subtotal: reservaAEditar.subtotal || 0,
    descuento: reservaAEditar.descuento || 0
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const idReserva = reservaAEditar.reserva_id || reservaAEditar.id;

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/reservations/update/${idReserva}`, {
        method: 'PUT',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire({ icon: 'success', title: 'Éxito', text: 'Reserva actualizada correctamente.' });
        fetchData();
        setModalAbierto(false);
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
