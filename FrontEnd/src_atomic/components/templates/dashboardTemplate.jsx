import styled from "styled-components";
import { useState } from "react";

import Notifications from "../organisms/notifications";

import HeaderGeneral from "../organisms/headerGeneral";
import Navbar from "../organisms/nav/navbar";
import MainGeneral from "./mainGeneral";
import { useReservationNotifications } from "../../hooks/useReservationNotifications";

import { Outlet, Navigate } from "react-router-dom";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100vw;
  overflow-x: hidden;
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
  background-color: #f8f9fa;
  
  .mainGeneral {
    padding: 20px;
  }
`;

function DashboardTemplate({ modulo, children }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const { hasNewNotification, setHasNewNotification } = useReservationNotifications();

  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/" replace />;
  }

  const handleOpenNotifications = () => {
    setShowNotifications(true);
    setHasNewNotification(false); // Clear badge when opened
  };

  return (
    <Container>
      <Navbar 
        onNotificationClick={handleOpenNotifications} 
        hasNewNotification={hasNewNotification} 
        user={localStorage.getItem('userName') || 'Usuario'}
      />
      <ContentWrapper>
        {showNotifications && (
          <Notifications
            onClose={() => setShowNotifications(false)}
            show={showNotifications}
          />
        )}
        <MainGeneral modulo={modulo} className="mainGeneral">
          {children || <Outlet />}
        </MainGeneral>
      </ContentWrapper>
    </Container>
  );
}

export default DashboardTemplate;