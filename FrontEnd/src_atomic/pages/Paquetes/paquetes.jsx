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

import PaquetesCards from "./componentsData/paquetesCards";
import PaquetesSearch, {
  paquetesFilterConfig,
} from "./componentsData/paquetesSearch";

const CardsCont = styled.div`
  margin: 50px 0;
  display: grid;
  grid-template-columns: 65% 30%;
  align-items: center;
  gap: 20px;

  @media (max-width: 1300px) {
    grid-template-columns: repeat(1, 1fr);
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

const Botones = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 10px;

  @media (max-width: 750px) {
    flex-direction: column;
    gap: 10px;
  }
`;

function Paquetes() {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [paqueteAEditar, setPaqueteAEditar] = useState(null);
  const { data, loading, error, fetchData } = useFetch();

  const [paquetes, setPaquetes] = useState(null);
  const { displayData, setFilterMode, fetchFilters } = useFilters(
    data,
    paquetes,
    paquetesFilterConfig,
  );
  const [refreshStatsTrigger, setRefreshStatsTrigger] = useState(0);

  const handleFetchData = () => {
    setPaquetes(null);
    fetchData(`${import.meta.env.VITE_API_BASE_URL}/api/packages`);
    fetchFilters();
    setRefreshStatsTrigger((prev) => prev + 1);
  };

  useEffect(() => {
    fetchData(`${import.meta.env.VITE_API_BASE_URL}/api/packages`);
  }, [fetchData]);

  const editarPaquete = (paquete) => {
    setPaqueteAEditar(paquete);
    setModalEditarAbierto(true);
  };

  const eliminarPaquete = (paquete) => {
    deleteUtils.eliminarRegistro(
      "packages",
      paquete.id,
      paquete.tipo,
      handleFetchData
    );
  };

  const activarPaquete = (paquete) => {
    activateUtils.activarRegistro(
      "packages",
      paquete.id,
      paquete.tipo,
      handleFetchData
    );
  };

  return (
    <>
      <CardsCont>
        <PaquetesCards refreshTrigger={refreshStatsTrigger} />
      </CardsCont>

      <ModulosExtra>
        <button
          onClick={() => { fetchData(`${import.meta.env.VITE_API_BASE_URL}/api/packages`); }}
        >paquetes</button>
        <button
          onClick={() => { fetchData(`${import.meta.env.VITE_API_BASE_URL}/api/packages/types`); }}
        >tipos de paquetes</button>
      </ModulosExtra>

      <Botones>
        <PaquetesSearch onResult={setPaquetes} onFilterChange={setFilterMode} />
        <BotonAgregar
          modulo="Agregar paquete"
          color={1}
          onClick={() => setModalAbierto(true)}
        />
      </Botones>

      {loading && <p style={{ marginTop: "20px" }}>Cargando paquetes...</p>}
      {error && (
        <p style={{ marginTop: "20px", color: "red" }}>Error: {error}</p>
      )}
      {displayData && (() => {
        // Deduplicar: quedarse solo con 1 paquete por combinación (Cabaña + Tipo)
        const deduplicar = (datos) => {
          if (!datos || datos.length === 0) return datos;
          const mapa = new Map();
          datos.forEach(item => {
            const tipoPaquete = item.tipo || item['Tipo'] || '';
            const clave = `${item['Cabaña'] || ''}_${tipoPaquete}`;
            const existente = mapa.get(clave);
            if (!existente || (item.id > existente.id)) {
              mapa.set(clave, item);
            }
          });
          return Array.from(mapa.values());
        };
        const datosUnicos = deduplicar(displayData);

        return datosUnicos.length > 0 && datosUnicos[0]['Cabaña'] ? (
          <>
            {Array.from(new Set(datosUnicos.map(item => item['Cabaña']))).map(cabana => (
              <div key={cabana} style={{ marginBottom: '40px' }}>
                <h3 style={{ marginBottom: '15px', color: '#43523A', borderBottom: '2px solid #43523A', paddingBottom: '5px' }}>Paquetes - {cabana}</h3>
                <TablaGeneral
                  data={datosUnicos.filter(item => item['Cabaña'] === cabana)}
                  onEdit={editarPaquete}
                  onActive={activarPaquete}
                  onDelete={eliminarPaquete}
                />
              </div>
            ))}
          </>
        ) : (
          <TablaGeneral
            data={datosUnicos}
            onEdit={editarPaquete}
            onActive={activarPaquete}
            onDelete={eliminarPaquete}
          />
        );
      })()}

      {modalAbierto && (
        <ModalAgregar
          setModalAbierto={setModalAbierto}
          fetchData={handleFetchData}
        />
      )}

      {modalEditarAbierto && paqueteAEditar && (
        <ModalEditar
          setModalAbierto={setModalEditarAbierto}
          fetchData={handleFetchData}
          paqueteAEditar={paqueteAEditar}
        />
      )}
    </>
  );
}

export default Paquetes;
