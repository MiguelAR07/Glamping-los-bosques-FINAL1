import styled from "styled-components";
import { useState, useEffect } from "react";
import { useFetch } from "../../hooks/fetchConnect";

import { useFilters } from "../../hooks/useFilters";

import BotonAgregar from "../../components/atoms/buttons/botonAgregar";
import TablaGeneral from "../../components/organisms/tabla";
import ModalAgregar from "./modales/modalAgregar";
import ModalFactura from "./modales/modalFactura";

import PagosCard from "./componentsData/pagosCards";
import Buscador, {
  pagosFilterConfig
} from "./componentsData/pagosSearch";

const ModulosExtra = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;

  button {
    padding: 10px;
    background-color: #eeeeeeff;
    color: #363636;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-weight: bold;
    &:hover {
      background-color: #d9d9d9ff;
    }
    &.active {
      background-color: #43523A;
      color: white;
    }
  }
`;

const Botones = styled.div`
  display: flex;
  justify-content: space-between;

  @media (max-width: 750px) {
    flex-direction: column;
    gap: 10px;
  }
`;

const TablaFactura = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 40px;
  height: 100vh;
`;

function Pagos() {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalFacturaAbierto, setModalFacturaAbierto] = useState(false);
  const [selectedFactura, setSelectedFactura] = useState(null);
  const { data, loading, error, fetchData } = useFetch();

  const [pagos, setPagos] = useState(null);
  const { displayData, setFilterMode, fetchFilters } = useFilters(
    data,
    pagos,
    pagosFilterConfig
  );
  const [refreshStatsTrigger, setRefreshStatsTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState('payments');

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    fetchData(`${import.meta.env.VITE_API_BASE_URL}/api/${tab}`);
  };

  const handleFetchData = () => {
    setPagos(null); // Clear search to show updated table
    handleTabChange('payments');
    fetchFilters();
    setRefreshStatsTrigger(prev => prev + 1);
  };

  useEffect(() => {
    fetchData(`${import.meta.env.VITE_API_BASE_URL}/api/payments`);
  }, [fetchData]);

  const handleViewFactura = (factura) => {
    setSelectedFactura(factura);
    setModalFacturaAbierto(true);
  };

  const renderAcciones = (fila) => {
    if (activeTab === 'invoices') {
      return (
        <button className="columnClick" onClick={() => handleViewFactura(fila)} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <i className="bi bi-receipt"></i> Ver Factura
        </button>
      );
    }
    return null;
  };

  return (
    <>
      <PagosCard refreshTrigger={refreshStatsTrigger} />
      <div>
        <ModulosExtra>
          <button className={`module-button ${activeTab === 'refounds' ? 'active' : ''}`}
            onClick={() => {
              setPagos(null);
              handleTabChange('refounds')}}
          >Reembolsos</button>
          <button className={`module-button ${activeTab === 'invoices' ? 'active' : ''}`}
            onClick={() => {
              setPagos(null);
              handleTabChange('invoices')}}
          >Facturas</button>
          <button className={`module-button ${activeTab === 'comprobantes' ? 'active' : ''}`}
            onClick={() => {
              setPagos(null);
              handleTabChange('comprobantes')}}
          >Comprobantes</button>
        </ModulosExtra>

        <Botones>
          <Buscador
            activeTab={activeTab}
            onResult={setPagos}
            onFilterChange={setFilterMode}
          />

          <BotonAgregar
            modulo={'Agregar pago'}
            color={1}
            onClick={() => setModalAbierto(true)}
          />
        </Botones>

        {loading && <p style={{ marginTop: '20px' }}>Cargando...</p>}
        {error && <p style={{ marginTop: '20px', color: 'red' }}>Error: {error}</p>}
        {displayData && (
          <TablaGeneral 
            data={displayData} 
            acciones={renderAcciones}
          />
        )}
      </div>

      {modalAbierto && (
        <ModalAgregar
          setModalAbierto={setModalAbierto}
          fetchData={handleFetchData}
        />
      )}

      {modalFacturaAbierto && selectedFactura && (
        <ModalFactura 
          factura={selectedFactura}
          setModalAbierto={setModalFacturaAbierto}
        />
      )}
    </>
  );
}

export default Pagos;
