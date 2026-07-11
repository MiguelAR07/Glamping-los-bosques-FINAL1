import styled from 'styled-components';

const CardsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  max-width: 100%;
  gap: 16px;

  @media (max-width: 550px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  @media (max-width: 380px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.button`
  min-height: 140px;
  border-radius: 8px;
  border: none;
  padding: 16px;
  box-sizing: border-box;
  text-align: left;

  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  background: ${(props) => props.bgColor == 'verde' ? '#43523A' : '#ffffff'};
  color: ${(props) => props.bgColor === 'verde' ? '#ffffff' : '#1a1a1a'};
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.12);
  }

  p {
    font-size: 0.8rem;
    opacity: 0.8;
    margin-bottom: 8px;
  }

  h4 {
    font-size: 1.2rem;
    font-weight: 700;
  }

  @media (max-width: 768px) {
    min-height: 120px;
    padding: 12px;

    h4 {
      font-size: 1rem;
    }
  }
`;

function SquareCard({ squareData }) {
  return(
    <CardsContainer>
      {squareData.map((item, i) => {
        // Si tiene isButton, definimos el comportamiento de clic
        const isButton = item.isButton === true;
        
        return (
          <Card 
            key={i} 
            bgColor={item.bgColor}
            onClick={isButton ? item.action : undefined}
            style={{ cursor: isButton ? 'pointer' : 'default' }}
          >
            
            <p>{item.texto}</p>
            <h4>{item.titulo}</h4>
          </Card>
        );
      })}
    </CardsContainer>
  );
}

export default SquareCard;
