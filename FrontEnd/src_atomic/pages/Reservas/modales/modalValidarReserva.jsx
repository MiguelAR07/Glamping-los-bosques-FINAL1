import React, { useState } from 'react';
import styled from 'styled-components';
import Swal from 'sweetalert2';

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

const InfoRow = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;

  strong {
    color: #666;
    margin-bottom: 5px;
  }

  span {
    color: #333;
    font-size: 1.1em;
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

  .btn-reject {
    background: #c92a2a;
    color: white;
  }

  .btn-cancel {
    background: #ccc;
    color: #333;
  }
`;

const MotivoBox = styled.div`
  margin-top: 20px;
  background: #fff5f5;
  padding: 15px;
  border-radius: 6px;
  border: 1px solid #ffc9c9;

  label {
    display: block;
    color: #c92a2a;
    font-weight: bold;
    margin-bottom: 8px;
  }

  textarea {
    width: 100%;
    padding: 10px;
    border-radius: 4px;
    border: 1px solid #ccc;
    box-sizing: border-box;
    font-family: inherit;
  }
`;

function ModalValidarReserva({ reserva, onClose, onConfirm, onReject }) {
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [motivo, setMotivo] = useState('');
  const [loading, setLoading] = useState(false);
  const [servicios, setServicios] = useState([]);
  const [loadingServicios, setLoadingServicios] = useState(false);

  React.useEffect(() => {
    if (reserva && (reserva.reserva_id || reserva.id)) {
      const fetchServicios = async () => {
        setLoadingServicios(true);
        try {
          const token = localStorage.getItem("token");
          const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/reservations/services/${reserva.reserva_id || reserva.id}`, {
            headers: { "Authorization": `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setServicios(data);
          }
        } catch (error) {
          console.error("Error al obtener servicios:", error);
        } finally {
          setLoadingServicios(false);
        }
      };
      fetchServicios();
    }
  }, [reserva]);

  if (!reserva) return null;

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm(reserva);
    setLoading(false);
  };

  const handleReject = async () => {
    if (!motivo.trim()) {
      Swal.fire({ icon: 'warning', title: 'Atención', text: 'Por favor, ingresa un motivo para rechazar la reserva.' });
      return;
    }
    setLoading(true);
    await onReject(reserva, motivo);
    setLoading(false);
  };

  return (
    <ModalOverlay onClick={!loading ? onClose : null}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <h2>Validar Reserva</h2>
        
        <InfoRow>
          <strong>Cliente:</strong>
          <span>{reserva.cliente}</span>
        </InfoRow>

        <InfoRow>
          <strong>Paquete / Estancia:</strong>
          <span>{reserva.paquete}</span>
        </InfoRow>
        
        {reserva.tipo_paquete && (
          <InfoRow>
            <strong>Tipo de Paquete:</strong>
            <span>{reserva.tipo_paquete}</span>
          </InfoRow>
        )}

        <InfoRow>
          <strong>Estado Actual:</strong>
          <span>{reserva.estado}</span>
        </InfoRow>

        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          <strong style={{ color: '#43523A', display: 'block', marginBottom: '10px' }}>Servicios Solicitados:</strong>
          {loadingServicios ? (
            <span style={{ fontStyle: 'italic', color: '#666' }}>Cargando servicios...</span>
          ) : servicios.length > 0 ? (
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              {servicios.map((s, idx) => (
                <li key={idx} style={{ marginBottom: '5px' }}>
                  {s.nombre} (Para {s.cantidad_personas} personas) - ${s.precio}
                </li>
              ))}
            </ul>
          ) : (
            <span style={{ fontStyle: 'italic', color: '#666' }}>No solicitó servicios adicionales.</span>
          )}
        </div>

        {!showRejectForm ? (
          <BotonesGroup>
            <button 
              className="btn-cancel" 
              onClick={onClose} 
              disabled={loading}
            >
              Cancelar
            </button>
            <button 
              className="btn-reject" 
              onClick={() => setShowRejectForm(true)}
              disabled={loading}
            >
              <i className="bi bi-x-circle-fill"></i>
              Rechazar
            </button>
            <button 
              className="btn-confirm" 
              onClick={handleConfirm}
              disabled={loading}
            >
              <i className="bi bi-check-circle-fill"></i>
              {loading ? 'Confirmando...' : 'Confirmar Reserva'}
            </button>
          </BotonesGroup>
        ) : (
          <MotivoBox>
            <label>Motivo del Rechazo (Se enviará al cliente)</label>
            <textarea 
              rows="3" 
              placeholder="Ej: El comprobante adjunto no es válido o está ilegible..."
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              disabled={loading}
            />
            
            <BotonesGroup style={{ marginTop: '15px' }}>
              <button 
                className="btn-cancel" 
                onClick={() => setShowRejectForm(false)}
                disabled={loading}
              >
                Atrás
              </button>
              <button 
                className="btn-reject" 
                onClick={handleReject}
                disabled={loading}
              >
                <i className="bi bi-send-fill"></i>
                {loading ? 'Procesando...' : 'Rechazar y Notificar'}
              </button>
            </BotonesGroup>
          </MotivoBox>
        )}
      </ModalContent>
    </ModalOverlay>
  );
}

export default ModalValidarReserva;
