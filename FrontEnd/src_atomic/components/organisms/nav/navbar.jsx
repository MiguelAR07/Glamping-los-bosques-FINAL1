import { NavLink } from "react-router-dom";
import styled from "styled-components";

import { modulos } from "../../../config/modulos";

const NavBarContainer = styled.nav`
  width: 100%;
  padding: 10px 30px 0 30px;
  box-sizing: border-box;
  background-color: #43523A;
  display: flex;
  flex-direction: column;
  z-index: 1000;
  color: white;

  @media (max-width: 768px) {
    padding: 10px 15px 0 15px;
  }
`;

const TopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 10px;
`;

const BottomRow = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 10px;
  padding-bottom: 10px;

  @media (max-width: 768px) {
    border-top: none;
    padding: 0;
  }
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;

  .titulo img {
    width: 45px;
    height: 45px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid white;
    box-shadow: 0px 2px 8px rgba(0,0,0,0.3);
  }

  span {
    font-size: 1.1rem;
    font-weight: 600;
    white-space: nowrap;
    @media (max-width: 768px) {
      display: none;
    }
  }
`;

const ModulesCont = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
  flex: 1;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 60px;
    background: rgba(67, 82, 58, 0.95);
    backdrop-filter: blur(10px);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    justify-content: flex-start;
    padding: 0 15px;
    z-index: 9999;
    overflow-x: auto;
    overflow-y: hidden;
    scroll-behavior: smooth;
    gap: 15px;
    flex-wrap: nowrap;

    &::-webkit-scrollbar {
      display: none;
    }
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

const Module = styled.button`
  display: flex;
  align-items: center;
  gap: 5px;

  border: none;
  background: none;
  color: white;
  cursor: pointer;
  text-decoration: none;
  font-size: 0.85rem;

  h5 {
    margin: 0;
    font-weight: 500;
  }

  &.active {
    color: #40ff00ff;
    background: rgba(255, 255, 255, 0.1);
    padding: 5px 8px;
    border-radius: 8px;
  }

  &:hover:not(.active) {
    background: rgba(255, 255, 255, 0.05);
    padding: 5px 8px;
    border-radius: 8px;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 4px;
    padding: 5px;
    flex-shrink: 0;
    min-width: 55px;

    &.active {
      background: transparent;
      padding: 5px;
    }

    &:hover:not(.active) {
      padding: 5px;
    }

    h5 {
      font-size: 0.65rem;
    }

    i {
      font-size: 1.2rem;
    }
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;

  .user-info {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.9rem;
    
    @media (max-width: 768px) {
      display: none;
    }
  }

  button.icon-btn {
    background-color: transparent;
    border: none;
    color: white;
    font-size: 20px;
    cursor: pointer;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: 0.2s;

    &:hover {
      color: #40ff00ff;
    }
  }

  .logout-btn {
    display: flex;
    align-items: center;
    gap: 5px;
    background: rgba(255,255,255,0.1);
    border: none;
    color: white;
    padding: 8px 15px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 500;
    transition: 0.2s;

    &:hover {
      background: rgba(255, 50, 50, 0.2);
      color: #ffcccc;
    }

    .logout-text {
      @media (max-width: 768px) {
        display: none;
      }
    }
  }
`;

function Navbar({ onNotificationClick, hasNewNotification, user }) {
  const currentUserRole = (localStorage.getItem('userRole') || "").toLowerCase();

  const modulosDisponibles = modulos.filter(m =>
    !m.roles || m.roles.includes(currentUserRole)
  );

  return (
    <NavBarContainer>
      <TopRow>
        <LeftSection>
          <div className="titulo">
            <img src="/images/logo.jpeg" alt="Logo Glamping" />
          </div>
          <span>Panel de Control</span>
        </LeftSection>

        <RightSection>
          <button className="icon-btn" onClick={onNotificationClick}>
            <i className="bi bi-bell-fill" />
            {hasNewNotification && (
              <span style={{
                position: "absolute",
                top: "0",
                right: "0",
                width: "10px",
                height: "10px",
                backgroundColor: "red",
                borderRadius: "50%",
                boxShadow: "0 0 5px rgba(255,0,0,0.8)"
              }}></span>
            )}
          </button>

          <div className="user-info">
            <i className="bi bi-person-circle" style={{ fontSize: '1.2rem' }}></i>
            <span>{user}</span>
          </div>

          <button 
            className="logout-btn"
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('userRole');
              localStorage.removeItem('userName');
              window.location.href = '/';
            }}
          >
            <i className="bi bi-box-arrow-right"></i>
            <span className="logout-text">Salir</span>
          </button>
        </RightSection>
      </TopRow>

      <BottomRow>
        <ModulesCont>
          {modulosDisponibles.map((item, i) => (
            <Module
              key={i}
              as={NavLink}
              to={item.ruta}
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              <i className={item.icono}></i>
              <h5>{item.nombre}</h5>
            </Module>
          ))}
        </ModulesCont>
      </BottomRow>
    </NavBarContainer>
  );
}

export default Navbar;