import React, { useState } from 'react';
import styled from 'styled-components';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 30px;
  border-radius: 8px;
  width: 500px;
  max-width: 90%;
  
  h2 {
    margin-top: 0;
    color: #43523A;
    border-bottom: 2px solid #eee;
    padding-bottom: 10px;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 15px;

  label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
    color: #43523A;
  }

  input {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;
  }
`;

const BotonesGroup = styled.div`
  display: flex;
  gap: 15px;
  margin-top: 30px;

  button {
    flex: 1;
    padding: 12px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
    font-size: 1em;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
  }

  .btn-confirm {
    background: #0dcaf0;
    color: white;
  }

  .btn-cancel {
    background: #ccc;
    color: #333;
  }
`;

function ModalReprogramar({ reserva, onClose, onSuccess }) {
  // Format YYYY-MM-DD for input type="date"
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return d.toISOString().split('T')[0];
  };

  const [llegada, setLlegada] = useState(formatDateForInput(reserva.llegada));
  const [salida, setSalida] = useState(formatDateForInput(reserva.salida));
  const [loading, setLoading] = useState(false);

  if (!reserva) return null;

  const handleReprogramar = async () => {
    if (!llegada || !salida) {
      alert('Debes seleccionar ambas fechas.');
      return;
    }

    if (new Date(salida) <= new Date(llegada)) {
      alert('La fecha de salida debe ser posterior a la fecha de llegada.');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/reservations/reschedule/${reserva.reserva_id || reserva.id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          llegada: new Date(llegada + "T05:00:00").toISOString(), 
          salida: new Date(salida + "T05:00:00").toISOString() 
        })
      });

      if (response.ok) {
        alert("Reserva reprogramada exitosamente. Se ha notificado al cliente por correo.");
        onSuccess();
        onClose();
      } else {
        const errData = await response.json();
        alert(`Error: ${errData.message || 'No se pudo reprogramar la reserva'}`);
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión al reprogramar la reserva.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalOverlay onClick={!loading ? onClose : null}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <h2>Reprogramar Reserva</h2>
        <p>Cliente: <strong>{reserva.cliente}</strong></p>
        <p>Estancia Actual: {new Date(reserva.llegada).toLocaleString('es-CO', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true })} al {new Date(reserva.salida).toLocaleString('es-CO', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true })}</p>
        
        <FormGroup>
          <label>Nueva Fecha de Llegada</label>
          <input 
            type="date" 
            value={llegada}
            onChange={(e) => setLlegada(e.target.value)}
            disabled={loading}
          />
        </FormGroup>

        <FormGroup>
          <label>Nueva Fecha de Salida</label>
          <input 
            type="date" 
            value={salida}
            onChange={(e) => setSalida(e.target.value)}
            disabled={loading}
          />
        </FormGroup>

        <BotonesGroup>
          <button 
            className="btn-cancel" 
            onClick={onClose} 
            disabled={loading}
          >
            Cancelar
          </button>
          <button 
            className="btn-confirm" 
            onClick={handleReprogramar}
            disabled={loading}
          >
            <i className="bi bi-calendar2-check"></i>
            {loading ? 'Guardando...' : 'Confirmar Cambios'}
          </button>
        </BotonesGroup>
      </ModalContent>
    </ModalOverlay>
  );
}

export default ModalReprogramar;
