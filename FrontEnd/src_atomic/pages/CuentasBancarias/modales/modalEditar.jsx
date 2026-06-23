import React, { useState, useEffect } from "react";
import { alertUtils } from "../../../utils/alertUtils";

import ModalPlantilla from "../../../components/organisms/Modales/modalPlantilla";
import ModalAlerta from "../../../components/organisms/Modales/modalAlerta";
import InputLabel from "../../../components/atoms/inputs/inputLabel";

function ModalEditar({ setModalAbierto, fetchData, cuentaAEditar }) {
  const [banco, setBanco] = useState("");
  const [tipoCuenta, setTipoCuenta] = useState("");
  const [numeroCuenta, setNumeroCuenta] = useState("");
  const [titular, setTitular] = useState("");
  
  const [modalAlertaInfo, setModalAlertaInfo] = useState({
    isOpen: false,
    mensaje: "",
    hasFondo: true,
  });

  useEffect(() => {
    if (cuentaAEditar) {
      setBanco(cuentaAEditar.banco);
      setTipoCuenta(cuentaAEditar.tipo_cuenta);
      setNumeroCuenta(cuentaAEditar.numero_cuenta);
      setTitular(cuentaAEditar.titular);
    }
  }, [cuentaAEditar]);

  const Validacion = (e) => {
    e.preventDefault();

    if (!banco.trim() || !tipoCuenta.trim() || !numeroCuenta.trim() || !titular.trim()) {
      setModalAlertaInfo({
        isOpen: true,
        mensaje: "Por favor, complete todos los campos requeridos.",
        hasFondo: false,
      });
      return;
    }

    editarCuenta();
  };

  const editarCuenta = async () => {
    try {
      const cuentaActualizada = {
        banco: banco,
        tipo_cuenta: tipoCuenta,
        numero_cuenta: numeroCuenta,
        titular: titular,
        estado: cuentaAEditar.estado
      };

      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/cuentas-bancarias/${cuentaAEditar.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cuentaActualizada)
      });
      
      if (!res.ok) throw new Error("Error al actualizar la cuenta bancaria");

      alertUtils.exito("Cuenta actualizada correctamente");
      fetchData();
      setModalAbierto(false);
    } catch (error) {
      alertUtils.error("Error al actualizar la cuenta bancaria");
      console.error(error);
    }
  };

  return (
    <ModalPlantilla
      setModalAbierto={setModalAbierto}
      Accion={Validacion}
      titulo={"Editar Cuenta Bancaria"}
    >
      <InputLabel
        label={"Banco / Billetera Digital"}
        placeholder={"Ej. Bancolombia, Nequi"}
        value={banco}
        onChange={(e) => setBanco(e.target.value)}
        type="text"
      />

      <InputLabel
        label={"Tipo de Cuenta"}
        placeholder={"Ej. Ahorros, Corriente, Celular"}
        value={tipoCuenta}
        onChange={(e) => setTipoCuenta(e.target.value)}
        type="text"
      />

      <InputLabel
        label={"Número de Cuenta"}
        placeholder={"Ej. 123-456789-00"}
        value={numeroCuenta}
        onChange={(e) => setNumeroCuenta(e.target.value)}
        type="text"
      />

      <InputLabel
        label={"Titular de la Cuenta"}
        placeholder={"Ej. Glamping Los Bosques SAS"}
        value={titular}
        onChange={(e) => setTitular(e.target.value)}
        type="text"
      />

      {modalAlertaInfo.isOpen && (
        <ModalAlerta
          setModalAlertaAbierto={(isOpen) =>
            setModalAlertaInfo({ ...modalAlertaInfo, isOpen })
          }
          hasFondo={modalAlertaInfo.hasFondo}
          mensaje={modalAlertaInfo.mensaje}
        />
      )}
    </ModalPlantilla>
  );
}

export default ModalEditar;
