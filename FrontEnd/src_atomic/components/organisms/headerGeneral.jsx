import styled from "styled-components";

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  height: 60px;
  box-sizing: border-box;

  color: #343434;

  div{
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  button{
    background-color: transparent;
    border: none;
    color: #343434;
    font-size: 20px;
    cursor: pointer;
  }
`;

function HeaderGeneral({ user, onClick, hasNewNotification }) {
  return(
    <Header>
      <div>
        <i className="bi bi-arrow-right"></i>
        <h3>Hola, {user}</h3>
      </div>
      <div>
        <button onClick={ onClick } style={{ position: "relative" }}>
          <i className="bi bi-bell-fill" />
          {hasNewNotification && (
            <span style={{
              position: "absolute",
              top: "-5px",
              right: "-5px",
              width: "10px",
              height: "10px",
              backgroundColor: "red",
              borderRadius: "50%",
              boxShadow: "0 0 5px rgba(255,0,0,0.8)"
            }}></span>
          )}
        </button>
        
        <img src="/images/logo.jpeg" alt="Logo Glamping" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #ccc' }} />
      </div>
    </Header>
  );
}

export default HeaderGeneral;