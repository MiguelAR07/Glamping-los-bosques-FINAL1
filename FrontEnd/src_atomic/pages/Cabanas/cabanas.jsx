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

const Botones = styled.div`
  display: flex;
  justify-content: space-between;

  @media (max-width: 750px) {
    flex-direction: column;
    gap: 10px;
  }
`;

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
    fetchData(`${import.meta.env.VITE_API_BASE_URL}/api/${tab}`);
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
        </ModulosExtra>


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
