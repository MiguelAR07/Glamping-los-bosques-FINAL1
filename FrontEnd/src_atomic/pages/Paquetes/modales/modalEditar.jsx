import ModalPlantilla from "../../../components/organisms/Modales/modalPlantilla";
import { useForm } from "../../../hooks/useForm";
import SelectBase from "../../../components/atoms/select/selectBase";
import styled from "styled-components";
import { useState, useEffect } from "react";
import { useFetch } from "../../../hooks/fetchConnect";

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

export default function ModalEditar({ setModalAbierto, fetchData, paqueteAEditar }) {
  const [cabanas, setCabanas] = useState([]);
  const [tipos, setTipos] = useState([]);
  const { data: cabanasData, fetchData: fetchCabanas } = useFetch();
  const { data: tiposData, fetchData: fetchTipos } = useFetch();

  useEffect(() => {
    fetchCabanas(`${import.meta.env.VITE_API_BASE_URL}/api/cabins`);
    fetchTipos(`${import.meta.env.VITE_API_BASE_URL}/api/packages/types`);
  }, []);

  useEffect(() => {
    if (cabanasData) {
      setCabanas([
        { id: '', nombre: 'Selecciona una cabaña...', selected: 'selected' },
        ...cabanasData.map(c => ({ id: c.id, nombre: c.nombre }))
      ]);
    }
  }, [cabanasData]);

  useEffect(() => {
    if (tiposData) {
      setTipos([
        { id: '', nombre: 'Selecciona un tipo de paquete...', selected: 'selected' },
        ...tiposData.map(t => ({ id: t.tipo_id || t.id, nombre: t.nombre }))
      ]);
    }
  }, [tiposData]);
  // Utilizamos casi el mismo código que en agregar, pero pasando el objeto actual "productoAEditar"
  // como estado inicial. 
  // IMPORTANTE: Le pasamos 'PUT' como 4to argumento
  const urlParams = `${import.meta.env.VITE_API_BASE_URL}/api/packages/${paqueteAEditar.id}`;

  const { formData, handleChange, handleSubmit, submitting } = useForm(
    {
      cabana_id: paqueteAEditar.cabana_id ?? '',
      tipo_id: paqueteAEditar.tipo_id ?? '',
      nombre: paqueteAEditar.tipo ?? paqueteAEditar.Tipo ?? '',
      dias_estadia: paqueteAEditar.dias ?? '',
      descripcion: paqueteAEditar.descripcion ?? '',

      precio_promocional: paqueteAEditar.precio_promocional ?? paqueteAEditar.precio ?? 0,
      img_url: paqueteAEditar.img_url ?? '',

      userName: localStorage.getItem('userName') || '',
    },
    urlParams,
    () => {
      // Callback OnSuccess
      fetchData(`${import.meta.env.VITE_API_BASE_URL}/api/packages`);
      setModalAbierto(false); // Cerramos el modal al tener éxito
    },
    'PUT' // <--- Le decimos a nuestro custom hook que esto es una actualizacion
  );

  return (
    <ModalPlantilla modulo="editar paquete" onClose={() => setModalAbierto(false)}>
      <Form onSubmit={(e) => handleSubmit(e, () => setModalAbierto(false))}>
        <SelectBase 
          name="cabana_id" 
          options={cabanas} 
          value={formData.cabana_id} 
          onChange={handleChange} 
          valueKey="id" 
          nameKey="nombre" 
          required 
        />
        <SelectBase 
          name="tipo_id" 
          options={tipos} 
          value={formData.tipo_id} 
          onChange={handleChange} 
          valueKey="id" 
          nameKey="nombre" 
          required 
        />
        <input 
          type="number" 
          name="dias_estadia" 
          placeholder="Días de estadía" 
          value={formData.dias_estadia} 
          onChange={handleChange} 
          required 
        />
        <input 
          type="number" 
          name="precio_promocional" 
          placeholder="Precio Especial Promocional" 
          value={formData.precio_promocional} 
          onChange={handleChange} 
        />
        <input 
          type="text" 
          name="img_url" 
          placeholder="URL de la imagen (Ej: /public/promos/foto1.jpg)" 
          value={formData.img_url} 
          onChange={handleChange} 
        />
        <textarea 
          name="descripcion" 
          placeholder="Descripción del paquete" 
          value={formData.descripcion} 
          onChange={handleChange} 
          required 
        />
        <button type="submit" disabled={submitting}>
          {submitting ? 'Actualizando...' : 'Actualizar Paquete'}
        </button>
      </Form>
    </ModalPlantilla>
  );
}
