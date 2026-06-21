import styled from "styled-components";
import { useState, useEffect } from "react";
import { useFetch } from "../../hooks/fetchConnect";
import { useFilters } from "../../hooks/useFilters";
import { deleteUtils } from "../../utils/deleteUtils";
import { activateUtils } from "../../utils/activateUtils";

import BotonAgregar from "../../components/atoms/buttons/botonAgregar";
import BotonTab from "../../components/atoms/buttons/button";
import TablaGeneral from "../../components/organisms/tabla";

import ModalAgregar from "./modales/modalAgregar";
import ModalEditar from "./modales/modalEditar";
import PromocionesSearch, { promocionesFilterConfig } from "./componentsData/promocionesSearch";

const ModulosExtra = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  margin-top: 50px;
`;

const Botones = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 10px;

  @media (max-width: 750px) {
    flex-direction: column;
  }
`;

function Promociones() {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [promocionAEditar, setPromocionAEditar] = useState(null);

  const { data, loading, error, fetchData } = useFetch();
  const [promociones, setPromociones] = useState(null);
  
  const { displayData, setFilterMode, fetchFilters } = useFilters(
    data,
    promociones,
    promocionesFilterConfig
  );

  const handleFetchData = () => {
    setPromociones(null);
    fetchData(`${import.meta.env.VITE_API_BASE_URL}/api/promociones`);
    fetchFilters();
  };

  useEffect(() => {
    fetchData(`${import.meta.env.VITE_API_BASE_URL}/api/promociones`);
  }, [fetchData]);

  const editarPromocion = (promocion) => {
    setPromocionAEditar(promocion);
    setModalEditarAbierto(true);
  };

  const eliminarPromocion = (promocion) => {
    deleteUtils.eliminarRegistro(
      "promociones",
      promocion.id,
      promocion.nombre,
      handleFetchData
    );
  };

  const activarPromocion = (promocion) => {
    activateUtils.activarRegistro(
      "promociones",
      promocion.id,
      promocion.nombre,
      handleFetchData
    );
  };

  return (
    <>
      <ModulosExtra>
        <button onClick={() => fetchData(`${import.meta.env.VITE_API_BASE_URL}/api/promociones`)} className="active">
          promociones
        </button>
      </ModulosExtra>

      <Botones>
        <PromocionesSearch onResult={setPromociones} onFilterChange={setFilterMode} />
        <BotonAgregar
          modulo="Agregar promoción"
          color={1}
          onClick={() => setModalAbierto(true)}
        />
      </Botones>

      {loading && <p style={{ marginTop: "20px" }}>Cargando promociones...</p>}
      {error && <p style={{ marginTop: "20px", color: "red" }}>Error: {error}</p>}
      
      {displayData && (
        <TablaGeneral
          data={displayData}
          onEdit={editarPromocion}
          onActive={activarPromocion}
          onDelete={eliminarPromocion}
        />
      )}

      {modalAbierto && (
        <ModalAgregar
          setModalAbierto={setModalAbierto}
          fetchData={handleFetchData}
        />
      )}

      {modalEditarAbierto && promocionAEditar && (
        <ModalEditar
          setModalAbierto={setModalEditarAbierto}
          fetchData={handleFetchData}
          promocionAEditar={promocionAEditar}
        />
      )}
    </>
  );
}

export default Promociones;
