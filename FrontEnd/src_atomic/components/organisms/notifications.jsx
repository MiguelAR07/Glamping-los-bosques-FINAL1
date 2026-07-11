import styled from "styled-components";
import NotificacionV1 from "../molecules/notificacionV1";
import { useFetch } from "../../hooks/fetchConnect";
import { useEffect, useState } from "react";

const Container = styled.div`
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
  padding: 20px;

  @media (max-width: 768px) {
    justify-content: center;
    align-items: center;
    padding: 10px;
  }
`;

const ModalCont = styled.div`
  width: 350px;
  max-width: 95vw;
  height: 500px;
  max-height: 80vh;
  padding: 10px 15px;
  box-sizing: border-box;

  background: rgba(30, 30, 30, 0.95);
  backdrop-filter: blur(10px);
  color: white;
  border-radius: 10px;
  margin-top: 60px;
  margin-right: 20px;

  display: flex;
  flex-direction: column;

  .scrollContent {
    overflow-y: auto;
    flex: 1;
  }

  .scrollContent::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  .scrollContent::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
  }

  ::-webkit-scrollbar-thumb {
    background: #c4c4c4ff;
    border-radius: 10px;
    border: 2px solid rgba(0, 0, 0, 0);
  }

  @media (max-width: 1024px) {
    margin-right: 10px;
    margin-top: 10px;
  }

  @media (max-width: 768px) {
    width: 100%;
    max-width: 100%;
    height: 80vh;
    margin: 0;
    border-radius: 10px;
  }
`;

const Options = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 10px 0;

  h4 {
    font-size: 0.95rem;
  }

  .close {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: none;
    background: #dc3545;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.2s;

    &:hover {
      background: #c82333;
    }

    i {
      font-size: 0.65rem;
      color: white;
    }
  }
`;

const ClearAll = styled.button`
  border-radius: 5px;
  background-color: rgba(255, 255, 255, 0.15);
  color: white;
  border: none;
  margin-bottom: 12px;
  padding: 6px 12px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.8rem;
  transition: all 0.2s;

  &:hover {
    background-color: #ff3838ff;
    color: #ffffffff;
  }
`;

function Notifications({ onClose }) {
  const { data, fetchData } = useFetch();

  const handleFetchData = () => {
    fetchData(`${import.meta.env.VITE_API_BASE_URL}/api/notifications`);
  };

  useEffect(() => {
    handleFetchData();
  }, [fetchData]);

  const handleDeleteAll = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/notifications/all`, {
        method: 'DELETE',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('token')}`,
          "ngrok-skip-browser-warning": "true"
        },
        body: JSON.stringify({ userName: localStorage.getItem('userName') || 'Administrador' })
      });
      if (res.ok) handleFetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/notifications/${id}`, {
        method: 'DELETE',
        headers: {
          "Authorization": `Bearer ${localStorage.getItem('token')}`,
          "ngrok-skip-browser-warning": "true"
        }
      });
      if (res.ok) handleFetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Container onClick={onClose}>
      <ModalCont onClick={(e) => e.stopPropagation()}>
        <Options>
          <h4>Notificaciones</h4>

          <button className="close" onClick={onClose}>
            <i className="bi bi-x-lg"></i>
          </button>
        </Options>

        <ClearAll onClick={handleDeleteAll}>
          Borrar todas
        </ClearAll>


        <div className="scrollContent">
          <NotificacionV1
            data={data}
            title={'Notificaciones'}
            handleDelete={handleDelete}
          />
        </div>

      </ModalCont>
    </Container>
  );
}

export default Notifications;