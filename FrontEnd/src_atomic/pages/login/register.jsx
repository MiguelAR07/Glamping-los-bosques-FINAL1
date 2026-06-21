import { useState } from "react";
import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";
import { useFetch } from "../../hooks/fetchConnect";

import LoginTemplate from "../../components/templates/loginTemplate";
import VerificationCode from "./verificationCode";

function Register() {
  const navigate = useNavigate();
  const { loading: submitting, error, fetchData } = useFetch();
  
  const [step, setStep] = useState(1);
  const [registrationToken, setRegistrationToken] = useState("");

  const [formData, setFormData] = useState({
    tipo_identificacion: 'CC',
    numero_identificacion: '',
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
      const response = await fetchData(`${import.meta.env.VITE_API_BASE_URL}/api/login/send-verification-code`, {
        method: 'POST',
        body: JSON.stringify({
          tipo_identificacion: formData.tipo_identificacion,
          numero_identificacion: formData.numero_identificacion,
          email: formData.email,
          contrasena: formData.contrasena
        })
      });
      
      if (response && response.registrationToken) {
        setRegistrationToken(response.registrationToken);
        setStep(2);
        alert("Código enviado a tu correo. Por favor, revísalo.");
      }
    } catch (err) {
      console.error(err);
      alert(err.message || "Error al enviar el código de verificación.");
    }
  };

  const handleCodeSubmit = async (submittedCode) => {
    try {
      const response = await fetchData(`${import.meta.env.VITE_API_BASE_URL}/api/login/create`, {
        method: 'POST',
        body: JSON.stringify({
          registrationToken,
          code: submittedCode
        })
      });

      if (response) {
        alert("Usuario registrado/vinculado exitosamente.");
        navigate("/login");
      }
    } catch (err) {
      console.error(err);
      alert("Error al verificar el código o crear el registro.");
    }
  };

  return (
    <LoginTemplate>
      <h4>Nos alegra tenerte en nuestro equipo</h4>

      {step === 1 && (
        <form onSubmit={handleInitialSubmit}>
          <label htmlFor="tipo_identificacion">Identificacion</label>
          <Identificacion>
            <select 
              name="tipo_identificacion" 
              value={formData.tipo_identificacion}
              onChange={handleChange}
            >
              <option value="CC">CC</option>
              <option value="CE">CE</option>
              <option value="TI">TI</option>
            </select>
            <input
              type="text"
              name="numero_identificacion"
              value={formData.numero_identificacion}
              onChange={handleChange}
              required
            />
          </Identificacion>

          <label htmlFor="email">Correo Electronico</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label htmlFor="contrasena">Contraseña</label>
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
            {submitting ? 'Enviando código...' : 'Registrarse'}
          </button>
        </form>
      )}

      {step === 2 && (
        <VerificationCode 
          email={formData.email}
          onSubmit={handleCodeSubmit}
          onBack={() => setStep(1)}
          submitting={submitting}
          buttonText="Completar Registro"
        />
      )}

      <Link to="/login">¿Ya tienes una cuenta?</Link>
    </LoginTemplate>
  )
}

export default Register;

const Identificacion = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 10px;

  select {
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    color: #333;
    font-size: 14px;
  }

  select:focus {
    outline: none;
  }

  input {
    width: 100%;
  }
`;