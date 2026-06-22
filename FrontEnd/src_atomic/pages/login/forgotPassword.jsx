import { useState } from "react";
import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";
import { useFetch } from "../../hooks/fetchConnect";

import LoginTemplate from "../../components/templates/loginTemplate";
import VerificationCode from "./verificationCode";

function ForgotPassword() {
  const navigate = useNavigate();
  const { loading: submitting, error, fetchData } = useFetch();
  
  const [step, setStep] = useState(1);
  const [resetToken, setResetToken] = useState("");
  
  const [formData, setFormData] = useState({
    email: '',
    contrasena: '',
    confirmContrasena: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleInitialSubmit = async (e) => {
    e.preventDefault();
    if (formData.contrasena !== formData.confirmContrasena) {
      alert("Las contraseñas no coinciden. Por favor, verifícalas.");
      return;
    }

    try {
      const response = await fetchData(`${import.meta.env.VITE_API_BASE_URL}/api/login/send-reset-code`, {
        method: 'POST',
        body: JSON.stringify({
          email: formData.email,
          contrasena: formData.contrasena
        })
      });
      
      if (response && response.resetToken) {
        setResetToken(response.resetToken);
        setStep(2);
        alert("Código de recuperación enviado a tu correo. Por favor, revísalo.");
      }
    } catch (err) {
      console.error(err);
      alert(err.message || "Error al enviar el código de recuperación.");
    }
  };

  const handleCodeSubmit = async (submittedCode) => {
    try {
      const response = await fetchData(`${import.meta.env.VITE_API_BASE_URL}/api/login/reset-password`, {
        method: 'POST',
        body: JSON.stringify({
          resetToken,
          code: submittedCode
        })
      });

      if (response) {
        alert("Contraseña restablecida exitosamente.");
        navigate("/login");
      }
    } catch (err) {
      console.error(err);
      alert(err.message || "Error al verificar el código o restablecer la contraseña.");
    }
  };
  return (
    <LoginTemplate>
      <h1>Hola, Bienvenido de Nuevo!</h1>
      <h4>Nos alegra tenerte de vuelta por aqui</h4>

      {step === 1 && (
        <form onSubmit={handleInitialSubmit}>
          <label htmlFor="email">Correo Electronico</label>
          <input 
            type="email" 
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label htmlFor="contrasena">Nueva Contraseña</label>
          <input 
            type="password" 
            name="contrasena"
            value={formData.contrasena}
            onChange={handleChange}
            required
          />

          <label htmlFor="confirmContrasena">Confirmar Contraseña</label>
          <input 
            type="password" 
            name="confirmContrasena"
            value={formData.confirmContrasena}
            onChange={handleChange}
            required
          />

          <button type="submit" disabled={submitting}>
            {submitting ? 'Enviando código...' : 'Restablecer Contraseña'}
          </button>
        </form>
      )}

      {step === 2 && (
        <VerificationCode 
          email={formData.email}
          onSubmit={handleCodeSubmit}
          onBack={() => setStep(1)}
          submitting={submitting}
          buttonText="Confirmar Restablecimiento"
        />
      )}

      <div>
        <Line />
        <p>O</p>
        <Line />
      </div>

      <Link to="/login">¿Ya tienes una cuenta?</Link>
      <Link to="/register">¿No tienes una cuenta?</Link>
    </LoginTemplate>
  )
}

export default ForgotPassword;

const Line = styled.div`
  width: 100px;
  height: 2px;
  background-color: #424242ff;
  border: 1px solid #424242ff;
`;