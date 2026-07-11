import styled from 'styled-components';
import ObtenerHora from "../atoms/horaActual";

const Main = styled.main`
  width: 100%;
  flex: 1;
  padding: 20px;
  background: #F6F6F6;

  @media (max-width: 1024px) {
    padding: 16px;
  }

  @media (max-width: 768px) {
    padding: 12px;
  }
`;

const Title = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;

  h3 {
    font-size: 1.3rem;

    @media (max-width: 768px) {
      font-size: 1.1rem;
    }
  }
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