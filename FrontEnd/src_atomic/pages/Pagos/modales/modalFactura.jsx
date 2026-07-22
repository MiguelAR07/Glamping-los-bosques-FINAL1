import React, { useEffect, useState, useRef } from "react";
import styled from "styled-components";
import { X, MapPin, Calendar, Users, Download } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

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
  border-radius: 24px;
  width: 100%;
  max-width: 700px;
  position: relative;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: white;
  border: none;
  cursor: pointer;
  color: #6b7280;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  z-index: 20;
  &:hover {
    background: #f3f4f6;
    color: #111827;
  }
`;

const Header = styled.div`
  background: #059669; /* emerald-600 */
  padding: 32px;
  text-align: center;
  color: white;
  position: relative;
  flex-shrink: 0;
  h1 {
    font-size: 1.5rem;
    font-weight: 800;
    margin-bottom: 8px;
    position: relative;
    z-index: 10;
  }
  p {
    color: #d1fae5; /* emerald-100 */
    font-size: 1rem;
    position: relative;
    z-index: 10;
    margin: 0;
  }
`;

const Body = styled.div`
  padding: 32px;
  background: #fafaf9; /* stone-50 */
  
  h2 {
    font-size: 1.25rem;
    font-weight: 700;
    color: #1c1917; /* stone-900 */
    margin-bottom: 24px;
    border-bottom: 1px solid #e7e5e4; /* stone-200 */
    padding-bottom: 16px;
    margin-top: 0;
  }
`;

const ItemRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;

  .icon-container {
    color: #059669; /* emerald-600 */
    margin-top: 4px;
    flex-shrink: 0;
  }

  .content {
    p.title {
      font-weight: 600;
      color: #1c1917;
      margin: 0;
    }
    p.desc {
      font-size: 0.875rem;
      color: #78716c; /* stone-500 */
      margin: 0;
    }
    p.highlight {
      font-size: 0.875rem;
      font-weight: 500;
      color: #047857; /* emerald-700 */
      margin: 4px 0 0 0;
    }
  }
`;

const ClientRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #e7e5e4;
  margin-top: 8px;

  .content {
    p.label {
      font-size: 0.75rem;
      color: #a8a29e; /* stone-400 */
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.05em;
      margin: 0 0 4px 0;
    }
    p.name {
      font-size: 0.875rem;
      font-weight: 500;
      color: #44403c; /* stone-700 */
      margin: 0;
    }
    p.doc {
      font-size: 0.875rem;
      color: #57534e; /* stone-600 */
      margin: 0;
    }
  }
`;

const TotalBox = styled.div`
  background: white;
  padding: 20px;
  border-radius: 16px;
  border: 1px solid #e7e5e4;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  margin-top: 32px;

  h3 {
    font-weight: 600;
    color: #1c1917;
    margin: 0 0 12px 0;
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.025em;
  }
  
  .total-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    
    span.label {
      color: #78716c;
      font-size: 0.875rem;
    }
    span.amount {
      font-size: 1.875rem;
      font-weight: 900;
      color: #047857;
      line-height: 1;
    }
  }
`;

const formatMoney = (value) => {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);
};

export default function ModalFactura({ factura, setModalAbierto }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef();

  const handleDownloadPDF = async () => {
    if (!printRef.current) return;
    try {
      const element = printRef.current;
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Factura_${factura.id}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  useEffect(() => {
    if (!factura || !factura.reserva) return;
    const fetchReservaDetails = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/reservations`);
        const data = await res.json();
        const r = data.find(x => x.id === factura.reserva || x.reserva_id === factura.reserva);
        if (r) {
          setDetails(r);
        }
      } catch (err) {
        console.error("Error fetching reservation details for invoice", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReservaDetails();
  }, [factura]);

  if (!factura) return null;

  return (
    <Overlay onClick={() => setModalAbierto(false)}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <CloseButton onClick={() => setModalAbierto(false)}>
          <X size={18} />
        </CloseButton>

        <div ref={printRef} style={{ background: 'white' }}>
          <Header>
            <h1>Factura #{factura.id}</h1>
            <p>Detalles de la estadía y facturación</p>
          </Header>

          <Body>
            <h2>Resumen de la Reserva</h2>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#78716c' }}>
              Cargando información...
            </div>
          ) : (
            <>
              <ItemRow>
                <div className="icon-container"><MapPin size={20} /></div>
                <div className="content">
                  <p className="title">{details ? details.cabaña : 'Cabaña'}</p>
                  <p className="desc">{details ? details.paquete : 'Plan de Estadía'}</p>
                </div>
              </ItemRow>

              <ItemRow>
                <div className="icon-container"><Calendar size={20} /></div>
                <div className="content">
                  <p className="title">Fecha</p>
                  <p className="desc">
                    {details && details.llegada ? new Date(details.llegada).toLocaleDateString('es-CO') : ''} 
                    {details && details.salida ? ` - ${new Date(details.salida).toLocaleDateString('es-CO')}` : ''}
                  </p>
                  <p className="highlight">
                    {details && details.paquete && details.paquete.toLowerCase().includes('ocasional') 
                      ? 'Ocasional' 
                      : 'Check-in 3:00 PM / Check-out 1:00 PM'}
                  </p>
                </div>
              </ItemRow>

              <ItemRow>
                <div className="icon-container"><Users size={20} /></div>
                <div className="content">
                  <p className="title">Huéspedes</p>
                  <p className="desc">A confirmar</p>
                </div>
              </ItemRow>

              <ClientRow>
                <div className="content">
                  <p className="label">A nombre de</p>
                  <p className="name">{factura.cliente || (details ? details.cliente : '')}</p>
                  <p className="doc">Documento / Cliente registrado</p>
                </div>
              </ClientRow>

              <TotalBox>
                <h3>Total a Pagar</h3>
                <div className="total-row">
                  <span className="label">Emisión: {new Date(factura.fecha || Date.now()).toLocaleDateString('es-CO')}</span>
                  <span className="amount">{formatMoney(factura.total)}</span>
                </div>
              </TotalBox>
            </>
          )}
          </Body>
        </div>
        
        <div style={{ textAlign: 'center', padding: '0 32px 32px 32px', background: '#fafaf9' }}>
          <button 
            onClick={handleDownloadPDF}
            style={{
              background: '#059669',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          >
            <Download size={18} /> Descargar Factura (PDF)
          </button>
        </div>
      </ModalContent>
    </Overlay>
  );
}
