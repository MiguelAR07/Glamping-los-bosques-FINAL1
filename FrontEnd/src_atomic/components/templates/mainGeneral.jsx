import styled from 'styled-components';
import ObtenerHora from "../atoms/horaActual";

const Main = styled.main`
  width: 100%;
  flex: 1;
  padding: 20px;

  background: #F6F6F6;
`;

const Title = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

function MainGeneral({ modulo, children }) {
  return (
    <Main>
      <Title>
        <h3>{modulo}</h3>
        <ObtenerHora></ObtenerHora>
      </Title>

      {children}
    </Main>
  );
}

export default MainGeneral;