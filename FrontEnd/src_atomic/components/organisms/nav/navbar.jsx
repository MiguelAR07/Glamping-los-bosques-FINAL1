import { NavLink } from "react-router-dom";
import styled from "styled-components";

import { modulos, userRole } from "../../../config/modulos";

const NavBar = styled.nav`
  width: 80px;
  height: 100vh;
  padding: 20px;
  box-sizing: border-box;
  background-color: #43523A;
  transition: 0.6s;

  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  z-index: 1000;

  h5, h4{
    display: none;
    margin: 0;
  }

  i{
    font-size: 20px;
  }

  .titulo{
    color: white;
    text-align: start;
    width: 100%;
    align-self: center;
  }

  &:hover{
    width: 140px;
    align-items: start;

    h5, h4{
      display: flex;
    }
  }

  @media (max-width: 768px) {
    width: 100%;
    height: 60px;
    position: fixed;
    bottom: 0;
    flex-direction: row;
    padding: 0 10px;
    justify-content: space-around;

    .titulo {
      display: none;
    }

    &:hover {
      width: 100%;
      align-items: center;
      h5, h4 {
        display: none;
      }
    }
  }
`;

const ModulesCont = styled.div`
  margin-top: 35px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;

  ${NavBar}:hover & {
    align-items: flex-start;
  }

  @media (max-width: 768px) {
    margin-top: 0;
    flex-direction: row;
    width: 100%;
    justify-content: space-around;
    gap: 0;

    ${NavBar}:hover & {
      align-items: center;
    }
  }
`;

const Module = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;

  border: none;
  background: none;
  color: white;
  cursor: pointer;
  text-decoration: none;

  &.active {
    color: #40ff00ff;
    background: #40723cff;
    padding: 5px 8px;
    border-radius: 5px;
  }

    &:hover:not(.active) {
    background: rgba(255, 255, 255, 0.05);
    padding: 5px 8px;
    border-radius: 5px;
  }
`;

function Navbar() {
  const currentUserRole = (localStorage.getItem('userRole') || "").toLowerCase();

  const modulosDisponibles = modulos.filter(m =>
    !m.roles || m.roles.includes(currentUserRole)
  );

  return (
    <NavBar>
      <div className="titulo">
        <img src="/images/logo.jpeg" alt="Logo Glamping" style={{ width: '55px', height: '55px', borderRadius: '50%', objectFit: 'cover', border: '2px solid white', boxShadow: '0px 2px 8px rgba(0,0,0,0.3)', margin: '0 auto', display: 'block' }} />
      </div>
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
        <Module
          onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('userRole');
            localStorage.removeItem('userName');
          }}
          as={NavLink}
          to={'/'}
        >
          <i className="bi bi-box-arrow-right"></i>
          <h4>Salir</h4>
        </Module>
      </ModulesCont>
    </NavBar>
  );
}

export default Navbar;