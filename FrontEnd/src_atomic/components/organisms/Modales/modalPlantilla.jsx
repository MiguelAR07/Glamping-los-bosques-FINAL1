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
`;

const ModalCont = styled.div`
  width: ${props => props.$width || "400px"};
  height: ${props => props.$height || "420px"};
  padding: 20px 20px;
  box-sizing: border-box;

  background: white;
  border-radius: 5px;
  position: relative;

  display: flex;
  flex-direction: column;
  justify-content: space-between;

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
`;

const Contenido = styled.div`
  height: calc(100% - 38.4px);
  padding: 20px 0px;
  overflow-y: auto;
`;

// const Botones = styled.div`
//   display: flex;
//   justify-content: space-between;
//   align-items: center;

//   button {
//     padding: 10px 20px;
//     display: flex;
//     gap: 10px;

//     background: #43523A;
//     border-radius: 5px;
//   }

//   .volver {
//     background: none;
//     color: #1b1b1b;
//   }
// `;

// const Volver = styled.button`
//   visibility: ${(props) => props.volver === 1 ? "visible" : "hidden"};
//   background: none;
// `;

const CloseModal = styled.button`  
  width: 20px;
  height: 20px;
  border-radius: 50%;
  
  position: absolute;
  top: 10px;
  right: 10px;

  background: red;
`;

function ModalPlantilla({ modulo, titulo, volver, onClose, children, onConfirm, width, height }) {
  // const [confirmVisible, setConfirmVisible] = useState(false);

  // const handleAgregar = () => {
  //   setConfirmVisible(true);
  // };

  // const confirmar = () => {
  //   setConfirmVisible(false);
  //   if (onConfirm) onClose(); // ejecuta lógica externa
  // };

  return (
    <Modal>
      <ModalCont $width={width} $height={height}>
        <h3>{titulo ? titulo : `Agregar ${modulo}`}</h3>

        <Contenido>
          {children}
        </Contenido>

        {/* <Botones>
          <Volver volver={volver} className="volver">
            <i className="bi bi-arrow-left"></i>
            Volver
          </Volver>
          <button onClick={handleAgregar}>
            <i className="bi bi-plus-circle-fill"></i>
            Agregar
          </button>
        </Botones> */}

        <CloseModal onClick={onClose}>
          <i className="bi bi-x-lg"></i>
        </CloseModal>
      </ModalCont>

      {/* {confirmVisible && (
        <Modal>
          <ModalCont>
            <div className="agregado">
              <h1>Agregado exitosamente</h1>
              <BotonEntendido onClose={confirmar} />
            </div>
          </ModalCont>
        </Modal>
      )} */}

    </Modal>
  );
}

export default ModalPlantilla;