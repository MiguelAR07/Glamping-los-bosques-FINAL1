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
`;

const Right = styled.div`
  width: calc(100% - 80px);
  overflow-x: hidden;

  .mainGeneral {
    overflow: auto;
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
      <Navbar />
      <Right>
        <HeaderGeneral
          user={localStorage.getItem('userName') || 'Usuario'}
          onClick={handleOpenNotifications}
          hasNewNotification={hasNewNotification}
        />
        {showNotifications && (
          <Notifications
            onClose={() => setShowNotifications(false)}
            show={showNotifications}
          />
        )}
        <MainGeneral modulo={modulo} className="mainGeneral">
          {children || <Outlet />}
        </MainGeneral>
      </Right>
    </Container>
  );
}

export default DashboardTemplate;