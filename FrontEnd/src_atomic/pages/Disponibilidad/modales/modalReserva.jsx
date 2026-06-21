import React from 'react';
import styled from 'styled-components';
import format from 'date-fns/format';
import { es } from 'date-fns/locale';
import ModalReprogramar from '../../Reservas/modales/modalReprogramar';

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
  width: 400px;
  max-width: 90%;
  
  h3 {
    margin-top: 0;
    color: #43523A;
    border-bottom: 2px solid #eeeeee;
    padding-bottom: 10px;
  }
`;

const DetailRow = styled.div`
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
  
  strong {
    color: #666;
    font-size: 0.9em;
    margin-bottom: 4px;
  }
  
  span {
    color: #333;
    font-size: 1.1em;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 25px;

  button {
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
    background: #43523A;
    color: white;
    transition: background 0.2s;
    
    &:hover {
      background: #323d2b;
    }
  }
`;

function ModalReserva({ setModalAbierto, event, fetchData }) {
  const [showReprogramar, setShowReprogramar] = React.useState(false);

  if (!event) return null;

  const handleForceCancel = async () => {
    if (!window.confirm("¿Estás seguro de cancelar esta reserva por fuerza mayor? Esto enviará un correo al cliente indicando que contacte al WhatsApp.")) return;
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/reservations/force-cancel/${event.id}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      if (res.ok) {
        alert("Reserva cancelada y correo enviado.");
        setModalAbierto(false);
        if (fetchData) fetchData();
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (err) {
      console.error(err);
      alert("Error al comunicar con el servidor.");
    }
  };

  return (
    <ModalOverlay onClick={() => setModalAbierto(false)}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <h3>Detalles de la Reserva</h3>
        
        <DetailRow>
          <strong>Cliente / Titular:</strong>
          <span>{event.title.replace(` (${event.cabana_nombre})`, '')}</span>
        </DetailRow>

        <DetailRow>
          <strong>Cabaña:</strong>
          <span>{event.cabana_nombre}</span>
        </DetailRow>

        <DetailRow>
          <strong>Día y Hora de Entrada:</strong>
          <span>{format(event.start, "EEEE d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}</span>
        </DetailRow>

        <DetailRow>
          <strong>Día y Hora de Salida:</strong>
          <span>{format(event.end, "EEEE d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}</span>
        </DetailRow>

        <ButtonGroup>
          {event.type === 'reserva' && (
            <>
              <button 
                type="button" 
                onClick={() => setShowReprogramar(true)}
                style={{ background: '#0d6efd', marginRight: '10px' }}
              >
                <i className="bi bi-calendar2-check" style={{ marginRight: '8px' }}></i>
                Reprogramar
              </button>
              <button 
                type="button" 
                onClick={handleForceCancel}
                style={{ background: '#c92a2a', marginRight: '10px' }}
              >
                <i className="bi bi-exclamation-triangle" style={{ marginRight: '8px' }}></i>
                Cancelar (Fuerza Mayor)
              </button>
            </>
          )}
          <button type="button" onClick={() => setModalAbierto(false)}>
            <i className="bi bi-arrow-left" style={{ marginRight: '8px' }}></i>
            Devolver
          </button>
        </ButtonGroup>
      </ModalContent>

      {showReprogramar && (
        <ModalReprogramar 
          reserva={{
            reserva_id: event.id,
            cliente: event.title.replace(` (${event.cabana_nombre})`, ''),
            llegada: event.start,
            salida: event.end
          }}
          onClose={() => setShowReprogramar(false)}
          onSuccess={() => {
            setShowReprogramar(false);
            setModalAbierto(false);
            if (fetchData) fetchData();
          }}
        />
      )}
    </ModalOverlay>
  );
}

export default ModalReserva;
