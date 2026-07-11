import styled from "styled-components";
import { useState, useEffect } from "react";
import { useFetch } from "../../hooks/fetchConnect";

import { useFilters } from "../../hooks/useFilters";
import { deleteUtils } from "../../utils/deleteUtils";
import { activateUtils } from "../../utils/activateUtils";

import BotonAgregar from "../../components/atoms/buttons/botonAgregar";
import TablaGeneral from "../../components/organisms/tabla";
import ModalAgregar from "./modales/modalAgregar";
import ModalEditar from "./modales/modalEditar";
import ModalImagenes from "./modales/modalImagenes";

import CabanasCard from "./componentsData/cabanaCard";
import Buscador, { cabinFilterConfig } from "./componentsData/cabinSearch";
import ImagenesCabanas from "./componentsData/imagenesCabanas";

const Botones = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;

  @media (max-width: 750px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const ModulosExtra = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;

  button {
    padding: 8px 14px;
    background-color: #eeeeeeff;
    color: #363636;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: bold;
    font-size: 0.85rem;
    transition: all 0.2s;
    white-space: nowrap;

    &:hover {
      background-color: #d9d9d9ff;
    }
    &.active {
      background-color: #43523A;
      color: white;
    }
  }

  @media (max-width: 768px) {
    gap: 6px;

    button {
      padding: 7px 12px;
      font-size: 0.8rem;
    }
  }
`;

function Cabanas() {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [registroAEditar, setRegistroAEditar] = useState(null);

  const [selectedCabin, setSelectedCabin] = useState(null)

  const [cabanas, setCabanas] = useState(null);
  const [activeTab, setActiveTab] = useState('cabins');

  const { data, loading, error, fetchData } = useFetch();
  const { displayData, setFilterMode, fetchFilters } = useFilters(
    data,
    cabanas,
    cabinFilterConfig
  );

  const [refreshStatsTrigger, setRefreshStatsTrigger] = useState(0);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCabanas(null);
    setFilterMode("Todos");
    if (tab !== 'images') {
      fetchData(`${import.meta.env.VITE_API_BASE_URL}/api/${tab}`);
    }
  };

  const handleFetchData = () => {
    handleTabChange(activeTab);
    fetchFilters();
    setRefreshStatsTrigger(prev => prev + 1);
  };

  const handleCabinClick = (fila) => {
    setSelectedCabin(fila)
  } 

  const closeMenu = () => {
    setSelectedCabin(null)
  };

  const onColumnClickHandlers = {
    nombre: handleCabinClick,
  };

  useEffect(() => {
    fetchData(`${import.meta.env.VITE_API_BASE_URL}/api/cabins`);
  }, [fetchData]);

  const eliminarRegistro = async (registro) => {
    deleteUtils.eliminarRegistro(
      activeTab,
      registro.id,
      registro.nombre || registro.cabana,
      handleFetchData
    );
  }

  const activarRegistro = async (registro) => {
    activateUtils.activarRegistro(
      activeTab,
      registro.id,
      registro.nombre || registro.cabana,
      handleFetchData
    );
  }

  const editarRegistro = (registro) => {
    setRegistroAEditar(registro);
    setModalEditarAbierto(true);
  }

  return (
    <>
      <CabanasCard refreshTrigger={refreshStatsTrigger} />

      <div>
        <ModulosExtra>
          <button
            className={`module-button ${activeTab === 'cabins' ? 'active' : ''}`}
            onClick={() => handleTabChange('cabins')}
          >Cabanas</button>

          <button
            className={`module-button ${activeTab === 'cabinDamage' ? 'active' : ''}`}
            onClick={() => handleTabChange('cabinDamage')}
          >Danos y mantenimientos</button>

          <button
            className={`module-button ${activeTab === 'images' ? 'active' : ''}`}
            onClick={() => handleTabChange('images')}
          >
            <i className="bi bi-images" style={{ marginRight: '6px' }}></i>
            Imágenes de cabañas
          </button>
        </ModulosExtra>

        {/* Solo mostrar buscador y botón agregar si NO estamos en el tab de imágenes */}
        {activeTab !== 'images' && (
          <Botones>
            <Buscador
              activeTab={activeTab}
              onResult={setCabanas}
              onFilterChange={setFilterMode}
            />
            <BotonAgregar
              modulo={activeTab === 'cabins' ? 'Agregar cabana' : 'Agregar dano'}
              color={1}
              onClick={() => setModalAbierto(true)}
            />
          </Botones>
        )}

        {/* Tab de imágenes */}
        {activeTab === 'images' && (
          <ImagenesCabanas />
        )}

        {/* Tabs de cabañas y daños */}
        {activeTab !== 'images' && (
          <>
            {loading && <p style={{ marginTop: '20px' }}>Cargando datos...</p>}
            {error && <p style={{ marginTop: '20px', color: 'red' }}>Error: {error}</p>}
            {displayData && (
              <TablaGeneral
                data={displayData}
                onColumnClick={onColumnClickHandlers}
                onEdit={editarRegistro} 
                onDelete={activeTab === 'cabins' ? eliminarRegistro : undefined}
                onActive={activeTab === 'cabins' ? activarRegistro : undefined}
              />
            )}
          </>
        )}
      </div>

      {modalAbierto && activeTab === 'cabins' && (
        <ModalAgregar
          setModalAbierto={setModalAbierto}
          fetchData={handleFetchData}
        />
      )}

      {modalEditarAbierto && activeTab === 'cabins' && registroAEditar && (
        <ModalEditar
          setModalAbierto={setModalEditarAbierto}
          fetchData={handleFetchData}
          cabanaAEditar={registroAEditar}
        />
      )}

      {selectedCabin && (
        <ModalImagenes 
          id={selectedCabin.cabana_id}
          onClose={closeMenu}
        />
      )}
    </>
  );
}

export default Cabanas;
