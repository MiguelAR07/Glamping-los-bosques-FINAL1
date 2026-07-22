import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { X, Receipt, User, MapPin, Calendar, CreditCard, Clock } from "lucide-react";

const Overlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  position: relative;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
  border-radius: 16px 16px 0 0;

  h2 {
    margin: 0;
    color: #111827;
    font-size: 1.5rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  button {
    background: none;
    border: none;
    cursor: pointer;
    color: #6b7280;
    padding: 8px;
    border-radius: 8px;
    transition: all 0.2s;

    &:hover {
      background: #e5e7eb;
      color: #111827;
    }
  }
`;

const Body = styled.div`
  padding: 24px;
`;

const Section = styled.div`
  margin-bottom: 24px;
  
  h3 {
    font-size: 1rem;
    font-weight: 600;
    color: #374151;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
    border-bottom: 2px solid #f3f4f6;
    padding-bottom: 8px;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  
  @media (max-width: 500px) {
    grid-template-columns: 1fr;
  }
`;

const InfoBox = styled.div`
  background: #f9fafb;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;

  label {
    display: block;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #6b7280;
    margin-bottom: 4px;
    font-weight: 600;
  }

  p {
    margin: 0;
    color: #111827;
    font-size: 1rem;
    font-weight: 500;
  }
`;

const TotalBox = styled.div`
  background: linear-gradient(135deg, #064e3b 0%, #047857 100%);
  border-radius: 16px;
  padding: 24px;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 32px;
  box-shadow: 0 10px 15px -3px rgba(4, 120, 87, 0.3);

  .labels {
    p {
      margin: 0;
      color: #d1fae5;
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-weight: 600;
    }
  }

  .amount {
    font-size: 2.5rem;
    font-weight: 800;
    margin: 0;
  }
`;

const formatMoney = (value) => {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);
};

export default function ModalFactura({ factura, setModalAbierto }) {
  const [reservaInfo, setReservaInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch reservation details using the invoice ID to get all the data
    const fetchReservation = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/reservations/invoice`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ id: factura.id })
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            setReservaInfo(data[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching reservation details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReservation();
  }, [factura.id]);

  if (!factura) return null;

  return (
    <Overlay onClick={() => setModalAbierto(false)}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <Header>
          <h2><Receipt className="text-emerald-600" /> Factura #{factura.id}</h2>
          <button onClick={() => setModalAbierto(false)}><X size={24} /></button>
        </Header>
        
        <Body>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Cargando información de la factura...</div>
          ) : (
            <>
              <Section>
                <h3><User size={18} /> Datos del Cliente</h3>
                <Grid>
                  <InfoBox>
                    <label>Nombre</label>
                    <p>{factura.cliente}</p>
                  </InfoBox>
                  <InfoBox>
                    <label>Identificación</label>
                    <p>{reservaInfo ? reservaInfo['Nro Identificación'] : 'N/A'}</p>
                  </InfoBox>
                  <InfoBox style={{ gridColumn: '1 / -1' }}>
                    <label>Contacto</label>
                    <p>{reservaInfo ? reservaInfo['Contacto'] : 'N/A'}</p>
                  </InfoBox>
                </Grid>
              </Section>

              <Section>
                <h3><Calendar size={18} /> Detalles de Estadía</h3>
                <Grid>
                  <InfoBox>
                    <label>Fecha Llegada</label>
                    <p>{reservaInfo && reservaInfo.Llegada ? new Date(reservaInfo.Llegada).toLocaleDateString('es-CO') : 'N/A'}</p>
                  </InfoBox>
                  <InfoBox>
                    <label>Fecha Salida</label>
                    <p>{reservaInfo && reservaInfo.Salida ? new Date(reservaInfo.Salida).toLocaleDateString('es-CO') : 'N/A'}</p>
                  </InfoBox>
                  <InfoBox>
                    <label>Cabaña / Paquete</label>
                    <p>{reservaInfo ? reservaInfo['Cabaña/Plan'] : 'N/A'}</p>
                  </InfoBox>
                  <InfoBox>
                    <label>Estado</label>
                    <p style={{ color: reservaInfo?.Estado === 'Confirmado' ? '#059669' : '#d97706', fontWeight: 'bold' }}>
                      {reservaInfo ? reservaInfo.Estado : 'N/A'}
                    </p>
                  </InfoBox>
                </Grid>
              </Section>

              <TotalBox>
                <div className="labels">
                  <p>Total Facturado</p>
                  <span style={{ color: '#a7f3d0', fontSize: '0.85rem' }}>Emisión: {new Date(factura.fecha).toLocaleDateString('es-CO')}</span>
                </div>
                <h1 className="amount">{formatMoney(factura.total)}</h1>
              </TotalBox>
              
              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                 <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Esta factura fue generada automáticamente por Glamping Los Bosques.</p>
              </div>
            </>
          )}
        </Body>
      </ModalContent>
    </Overlay>
  );
}
