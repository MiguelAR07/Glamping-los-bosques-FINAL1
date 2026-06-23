import styled from "styled-components";
import { useState, useEffect } from "react";
import { useFetch } from "../../hooks/fetchConnect";

import { deleteUtils } from "../../utils/deleteUtils";
import { activateUtils } from "../../utils/activateUtils";

import BotonAgregar from "../../components/atoms/buttons/botonAgregar";
import TablaGeneral from "../../components/organisms/tabla";

import ModalAgregar from "./modales/modalAgregar";
import ModalEditar from "./modales/modalEditar";

const Botones = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
  margin-bottom: 20px;

  @media (max-width: 750px) {
    flex-direction: column;
    gap: 10px;
  }
`;

function CuentasBancarias() {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [cuentaAEditar, setCuentaAEditar] = useState(null);
  
  const { data, loading, error, fetchData } = useFetch();

  const handleFetchData = () => {
    fetchData(`${import.meta.env.VITE_API_BASE_URL}/api/cuentas-bancarias`);
  };

  useEffect(() => {
    handleFetchData();
  }, []);

  const eliminarCuenta = (cuenta) => {
    deleteUtils.eliminarRegistro(
      "cuentas-bancarias",
      cuenta.id,
      cuenta.banco,
      handleFetchData,
    );
  };

  const activarCuenta = (cuenta) => {
    activateUtils.activarRegistro(
      "cuentas-bancarias",
      cuenta.id,
      cuenta.banco,
      handleFetchData,
    );
  };

  const editarCuenta = (cuenta) => {
    setCuentaAEditar(cuenta);
    setModalEditarAbierto(true);
  };

  return (
    <>
      <Botones>
        <BotonAgregar
          modulo={"Agregar Cuenta"}
          color={1}
          onClick={() => setModalAbierto(true)}
        />
      </Botones>

      {loading && <p style={{ marginTop: "20px" }}>Cargando cuentas bancarias...</p>}
      {error && (
        <p style={{ marginTop: "20px", color: "red" }}>Error: {error}</p>
      )}
      {data && (
        <TablaGeneral
          data={data}
          onEdit={editarCuenta}
          onActive={activarCuenta}
          onDelete={eliminarCuenta}
        />
      )}

      {modalAbierto && (
        <ModalAgregar
          setModalAbierto={setModalAbierto}
          fetchData={handleFetchData}
        />
      )}

      {modalEditarAbierto && cuentaAEditar && (
        <ModalEditar
          setModalAbierto={setModalEditarAbierto}
          fetchData={handleFetchData}
          cuentaAEditar={cuentaAEditar}
        />
      )}
    </>
  );
}

export default CuentasBancarias;
