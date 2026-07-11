import styled from "styled-components";
import { useState } from "react";
import ModalAgregado from "./modalAgregado";
import BotonEntendido from "../../atoms/buttons/botonEntendido";

const Modal = styled.div`
  width: 100%;
  height: 100vh;
  background: #00000098;

  position: fixed;
  z-index: 10000;
  top: 0;
  left: 0;

  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const ModalCont = styled.div`
  width: ${props => props.$width || "500px"};
  max-width: 95vw;
  height: ${props => props.$height || "auto"};
  max-height: 85vh;
  padding: 20px 20px;
  box-sizing: border-box;

  background: white;
  border-radius: 10px;
  position: relative;

  display: flex;
  flex-direction: column;

  button {
    border: 0;
    color: white;
    cursor: pointer;
  }

  .agregado {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 50px;
  }

  h3 {
    font-size: 1.1rem;
    padding-right: 30px;
  }

  @media (max-width: 768px) {
    width: 100%;
    max-width: 100vw;
    max-height: 90vh;
    border-radius: 10px;
    padding: 16px;

    h3 {
      font-size: 1rem;
    }
  }
`;

const Contenido = styled.div`
  flex: 1;
  padding: 15px 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
`;

const CloseModal = styled.button`  
  width: 28px;
  height: 28px;
  border-radius: 50%;
  
  position: absolute;
  top: 12px;
  right: 12px;

  background: #dc3545;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;

  &:hover {
    background: #c82333;
  }

  i {
    font-size: 0.7rem;
  }
`;

function ModalPlantilla({ modulo, titulo, volver, onClose, children, onConfirm, width, height }) {
  return (
    <Modal onClick={onClose}>
      <ModalCont $width={width} $height={height} onClick={(e) => e.stopPropagation()}>
        <h3>{titulo ? titulo : `Agregar ${modulo}`}</h3>

        <Contenido>
          {children}
        </Contenido>

        <CloseModal onClick={onClose}>
          <i className="bi bi-x-lg"></i>
        </CloseModal>
      </ModalCont>
    </Modal>
  );
}

export default ModalPlantilla;