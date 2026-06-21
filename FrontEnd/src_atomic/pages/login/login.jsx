import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "../../hooks/useForm";
import { useEffect } from "react";

import LoginTemplate from "../../components/templates/loginTemplate";

function Login() {
  const navigate = useNavigate();

  const { formData, handleChange, handleSubmit, submitting, submitError } = useForm(
    { email: '', contrasena: '' },
    `${import.meta.env.VITE_API_BASE_URL}/api/login`,
    (data) => {
      localStorage.setItem('token', data.token);
      localStorage.setItem('id', data.user.id);
      localStorage.setItem('userName', data.user.nombre);
      localStorage.setItem('userRole', data.user.rol);
      navigate('/inicio');
    },
  )

  useEffect(() => {
    if (submitError) {
      alert("Email o contraseña incorrectos");
    }
  }, [submitError]);

  return (
    <LoginTemplate>
      <img src="/images/logo.jpeg" alt="Logo Glamping" style={{ width: '140px', height: '140px', borderRadius: '50%', objectFit: 'cover', marginBottom: '15px', border: '3px solid #2D7800', boxShadow: '0px 4px 12px rgba(0,0,0,0.15)' }} />
      <h1>Hola, Bienvenido de Nuevo!</h1>
      <h4>Nos alegra tenerte de vuelta por aqui</h4>

      <form action="" onSubmit={handleSubmit}>

        <label htmlFor="">Correo Electronico</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <label htmlFor="">Contraseña</label>
        <input
          type="password"
          name="contrasena"
          value={formData.contrasena}
          onChange={handleChange}
          required
        />

        <button type="submit" disabled={submitting}>
          {submitting ? 'Iniciando Sesión...' : 'Iniciar Sesión'}
        </button>
      </form>

      <div>
        <Line />
        <p>O</p>
        <Line />
      </div>

      <Link to="/register">¿No tienes una cuenta?</Link>
      <Link to="/forgot-password">¿Olvidaste tu contraseña?</Link>
    </LoginTemplate>
  )
}

export default Login;

const Line = styled.div`
  width: 100px;
  height: 2px;
  background-color: #424242ff;
  border: 1px solid #424242ff;
`;
