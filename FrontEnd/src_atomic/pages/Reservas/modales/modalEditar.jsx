import React, { useState } from 'react';
import ModalPlantilla from "../../../components/organisms/Modales/modalPlantilla";
import { useForm } from "../../../hooks/useForm";
import styled from "styled-components";
import Swal from 'sweetalert2';

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;

  input, textarea {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    box-sizing: border-box;
    font-family: inherit;
  }

  textarea {
    resize: vertical;
    min-height: 80px;
  }

  button {
    padding: 10px;
    background-color: #4A90E2; /* Color distintivo para editar, ej: azul */
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-weight: bold;
    &:hover {
      background-color: #357ABD;
    }
  }
`;

export default function ModalEditar({ setModalAbierto, fetchData, usuarioAEditar }) {
  // Utilizamos casi el mismo código que en agregar, pero pasando el objeto actual "productoAEditar"
  // como estado inicial. 
  // IMPORTANTE: Le pasamos 'PUT' como 4to argumento
  const urlParams = `${import.meta.env.VITE_API_BASE_URL}/api/users/${usuarioAEditar.usuarioid}`;

  const { formData, handleChange, handleSubmit, submitting } = useForm(
    {
      rolid: usuarioAEditar.rolid || usuarioAEditar.rolid || '',
      identificacionid: usuarioAEditar.identificacionid || usuarioAEditar.identificacionid || '',
      nombre: usuarioAEditar.nombre || usuarioAEditar.Nombre || '',
      contacto: usuarioAEditar.contacto || usuarioAEditar.contacto || '',
      sueldo: usuarioAEditar.sueldo || usuarioAEditar.sueldo || '',
      numeroidentificacion: usuarioAEditar.numeroidentificacion || usuarioAEditar.numeroidentificacion || '',
      password: usuarioAEditar.password || usuarioAEditar.password || '',
      confirmPassword: usuarioAEditar.password || usuarioAEditar.password || '',
    },
    urlParams,
    () => {
      // Callback OnSuccess
      fetchData(`${import.meta.env.VITE_API_BASE_URL}/api/users`);
      setModalAbierto(false); // Cerramos el modal al tener éxito
    },
    'PUT' // <--- Le decimos a nuestro custom hook que esto es una actualizacion
  );

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      Swal.fire({ icon: 'warning', title: 'Atención', text: 'Las contraseñas no coinciden' });
      return;
    }

    handleSubmit(e, () => setModalAbierto(false));
  }

  return (
    <ModalPlantilla modulo="editar usuario" onClose={() => setModalAbierto(false)}>
      <Form onSubmit={handlePasswordSubmit}>
        <input
          type="number"
          name="rolid"
          placeholder="Rol"
          value={formData.rolid}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="identificacionid"
          placeholder="Identificación"
          value={formData.identificacionid}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="nombre"
          placeholder="Nombre del usuario"
          value={formData.nombre}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="contacto"
          placeholder="Contacto"
          value={formData.contacto}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="sueldo"
          placeholder="Sueldo"
          value={formData.sueldo}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="numeroidentificacion"
          placeholder="Número de identificación"
          value={formData.numeroidentificacion}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirmar contraseña"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />
        <button type="submit" disabled={submitting}>
          {submitting ? 'Actualizando...' : 'Actualizar Usuario'}
        </button>
      </Form>
    </ModalPlantilla>
  );
}
