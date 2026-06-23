import React, { useState } from "react";
import Swal from "sweetalert2";
import styled from "styled-components";

import ModalPlantilla from "../../../components/organisms/Modales/modalPlantilla";

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;

  input {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    box-sizing: border-box;
    font-family: inherit;
  }

  button {
    padding: 10px;
    background-color: #43523A;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-weight: bold;
    &:hover {
      background-color: #2c3825;
    }
  }
`;

function ModalAgregar({ setModalAbierto, fetchData }) {
  const [banco, setBanco] = useState("");
  const [tipoCuenta, setTipoCuenta] = useState("");
  const [numeroCuenta, setNumeroCuenta] = useState("");
  const [titular, setTitular] = useState("");
  
  const Validacion = (e) => {
    e.preventDefault();

    if (!banco.trim() || !tipoCuenta.trim() || !numeroCuenta.trim() || !titular.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor, complete todos los campos requeridos.'
      });
      return;
    }

    agregarCuenta();
  };

  const agregarCuenta = async () => {
    try {
      const nuevaCuenta = {
        banco: banco,
        tipo_cuenta: tipoCuenta,
        numero_cuenta: numeroCuenta,
        titular: titular,
        estado: true
      };

      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/cuentas-bancarias`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nuevaCuenta)
      });
      
      if (!res.ok) throw new Error("Error al agregar la cuenta bancaria");

      Swal.fire({
        icon: 'success',
        title: 'Cuenta agregada correctamente',
        showConfirmButton: false,
        timer: 1500
      });
      fetchData();
      setModalAbierto(false);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al agregar la cuenta bancaria'
      });
      console.error(error);
    }
  };

  return (
    <ModalPlantilla
      setModalAbierto={setModalAbierto}
      onClose={() => setModalAbierto(false)}
      titulo={"Agregar Cuenta Bancaria"}
    >
      <Form onSubmit={Validacion}>
        <input
          placeholder={"Banco / Billetera Digital (Ej. Bancolombia, Nequi)"}
          value={banco}
          onChange={(e) => setBanco(e.target.value)}
          type="text"
        />

        <input
          placeholder={"Tipo de Cuenta (Ej. Ahorros, Corriente, Celular)"}
          value={tipoCuenta}
          onChange={(e) => setTipoCuenta(e.target.value)}
          type="text"
        />

        <input
          placeholder={"Número de Cuenta (Ej. 123-456789-00)"}
          value={numeroCuenta}
          onChange={(e) => setNumeroCuenta(e.target.value)}
          type="text"
        />

        <input
          placeholder={"Titular de la Cuenta (Ej. Glamping Los Bosques SAS)"}
          value={titular}
          onChange={(e) => setTitular(e.target.value)}
          type="text"
        />

        <button type="submit">Agregar Cuenta</button>
      </Form>
    </ModalPlantilla>
  );
}

export default ModalAgregar;
