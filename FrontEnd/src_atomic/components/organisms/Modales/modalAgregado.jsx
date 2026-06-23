import styled from "styled-components";

import BotonEntendido from "../../atoms/buttons/botonEntendido";

const Modal = styled.div`
  width: 100%;
  height: 100vh;
  background: #00000098;

  position: absolute;
  z-index: 10000;
  top: 0;
  left: 0;

  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalCont = styled.div`
  width: 400px;
  height: 350px;
  padding: 30px 20px;
  box-sizing: border-box;

  background: white;
  color: #43523A;
  border-radius: 5px;
  position: relative;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 30px;

  h1 {
    text-align: center;
  }

  i {
    font-size: 60px;
  }

  button {
    border: 0;
    color: white;
    cursor: pointer;
  }
`;

function ModalAgregado({ onClose }) {
  return(
    <Modal>
      <ModalCont>
        <h1>agregado exitosamente!</h1>
        <BotonEntendido onClose={ onClose } />
      </ModalCont>
    </Modal>
  );
}

export default ModalAgregado;