import React, { cloneElement } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardTemplate from './components/templates/dashboardTemplate';
import { modulos } from './config/modulos';

import Login from './pages/login/login';
import Register from './pages/login/register';
import ForgotPassword from './pages/login/forgotPassword';
import PagarSaldo from './pages/SaldosRestantes/pagarSaldoPublico';

const isTokenValid = () => {
  const token = localStorage.getItem('token');
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userName');
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
};

const ProtectedRoute = ({ children, roles }) => {
  const isValid = isTokenValid();
  const currentUserRole = (localStorage.getItem('userRole') || "").toLowerCase();

  if (!isValid) {
    return <Navigate to="/" replace />;
  }

  if (roles && roles.length > 0) {
    if (!roles.some(role => role.toLowerCase() === currentUserRole)) {
      return <Navigate to="/inicio" replace />;
    }
  }

  return children;
};

const PublicRoute = ({ children }) => {
  if (isTokenValid()) {
    return <Navigate to="/inicio" replace />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
        <Route path="/pagar-saldo/:id" element={<PagarSaldo />} />

        <Route>
          {modulos.map((modulo, i) => (
            <Route
              key={i}
              path={modulo.ruta}
              element={
                <ProtectedRoute roles={modulo.roles}>
                  <DashboardTemplate modulo={modulo.nombre}>
                    {cloneElement(modulo.componente, { modulo: modulo.nombre })}
                  </DashboardTemplate>
                </ProtectedRoute>
              }
            />
          ))}

          <Route path="*" element={<Navigate to="/inicio" replace />} />
        </Route>
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;