import React, { useState } from 'react';
import styled from 'styled-components';
import format from 'date-fns/format';
import ModalAlerta from "../../../components/organisms/Modales/modalAlerta";

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 30px;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
  
  h3 {
    margin-top: 0;
    color: #43523A;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 15px;

  label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
    color: #333;
  }

  input, select, textarea {
    width: 100%;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;

  button {
    padding: 10px 15px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
  }

  .cancel {
    background: #ccc;
    color: #333;
  }

  .save {
    background: #43523A;
    color: white;
  }
`;

function ModalBloqueo({ setModalAbierto, fetchData, cabanas, initialDates }) {
  const [formData, setFormData] = useState({
    cabana_id: 'all',
    fecha_inicio: initialDates?.start ? format(initialDates.start, 'yyyy-MM-dd') : '',
    fecha_fin: initialDates?.end ? format(initialDates.end, 'yyyy-MM-dd') : '',
    motivo: ''
  });

  const [alertaConfig, setAlertaConfig] = useState({ isOpen: false, message: '', type: 'alert', isError: false });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/availability/block`, {
        method: 'POST',
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setModalAbierto(false);
        fetchData();
      } else {
        const errData = await res.json();
        setAlertaConfig({ isOpen: true, message: errData.message || "Error al bloquear las fechas.", type: 'alert', isError: true });
      }
    } catch (error) {
      console.error(error);
      setAlertaConfig({ isOpen: true, message: "Error de conexión al guardar.", type: 'alert', isError: true });
    }
  };

  return (
    <ModalOverlay onClick={() => setModalAbierto(false)}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <h3>Bloquear Fechas (V2)</h3>
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <label>Cabaña</label>
            <select name="cabana_id" value={formData.cabana_id} onChange={handleChange} required>
              <option value="all">Todas las cabañas</option>
              {cabanas.map(c => (
                <option key={c.cabana_id || c.id} value={c.cabana_id || c.id}>{c.nombre}</option>
              ))}
            </select>
          </FormGroup>

          <FormGroup>
            <label>Fecha de Inicio</label>
            <input 
              type="date" 
              name="fecha_inicio" 
              value={formData.fecha_inicio} 
              onChange={handleChange} 
              required 
            />
          </FormGroup>

          <FormGroup>
            <label>Fecha de Fin</label>
            <input 
              type="date" 
              name="fecha_fin" 
              value={formData.fecha_fin} 
              onChange={handleChange} 
              required 
            />
          </FormGroup>

          <FormGroup>
            <label>Motivo / Descripción (Ej: Mantenimiento, WhatsApp)</label>
            <textarea 
              name="motivo" 
              value={formData.motivo} 
              onChange={handleChange} 
              required 
              rows="3"
            />
          </FormGroup>

          <ButtonGroup>
            <button type="button" className="cancel" onClick={() => setModalAbierto(false)}>Cancelar</button>
            <button type="submit" className="save">Guardar Bloqueo</button>
          </ButtonGroup>
        </form>
      </ModalContent>

      <ModalAlerta 
        isOpen={alertaConfig.isOpen}
        message={alertaConfig.message}
        type={alertaConfig.type}
        isError={alertaConfig.isError}
        onConfirm={() => setAlertaConfig({ ...alertaConfig, isOpen: false })}
      />
    </ModalOverlay>
  );
}

export default ModalBloqueo;
