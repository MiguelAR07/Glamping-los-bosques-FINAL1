import styled from "styled-components";
import BotonEntendido from "../../atoms/buttons/botonEntendido";

const Modal = styled.div`
  width: 100%;
  height: 100vh;
  background: #00000098;

  position: fixed;
  z-index: 10050;
  top: 0;
  left: 0;

  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalCont = styled.div`
  width: 400px;
  padding: 30px 20px;
  box-sizing: border-box;

  background: white;
  color: #43523A;
  border-radius: 8px;
  position: relative;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 20px;

  h2 {
    text-align: center;
    margin: 0;
  }
  
  p {
    text-align: center;
    font-size: 1.1em;
    margin: 0;
  }

  i {
    font-size: 50px;
    color: ${props => props.isError ? '#c92a2a' : '#43523A'};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 15px;
  margin-top: 10px;

  button {
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
    font-size: 1em;
  }

  .cancel {
    background: #ccc;
    color: #333;
  }

  .confirm {
    background: ${props => props.isError ? '#c92a2a' : '#43523A'};
    color: white;
  }
`;

function ModalAlerta({ isOpen, message, type = 'alert', isError = false, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <Modal onClick={onCancel || onConfirm}>
      <ModalCont isError={isError} onClick={e => e.stopPropagation()}>
        {isError ? <i className="bi bi-x-circle-fill"></i> : type === 'confirm' ? <i className="bi bi-question-circle-fill"></i> : <i className="bi bi-info-circle-fill"></i>}
        <h2>{type === 'confirm' ? 'Confirmación' : (isError ? 'Error' : 'Aviso')}</h2>
        <p>{message}</p>
        
        <ButtonGroup isError={isError}>
          {type === 'confirm' && (
            <button className="cancel" onClick={onCancel}>Cancelar</button>
          )}
          <button className="confirm" onClick={onConfirm}>Aceptar</button>
        </ButtonGroup>
      </ModalCont>
    </Modal>
  );
}

export default ModalAlerta;
