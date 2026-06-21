import ModalPlantilla from "../../../components/organisms/Modales/modalPlantilla";
import { useForm } from "../../../hooks/useForm";
import styled from "styled-components";

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

export default function ModalEditar({ setModalAbierto, fetchData, cabanaAEditar }) {
  // Utilizamos casi el mismo código que en agregar, pero pasando el objeto actual "productoAEditar"
  // como estado inicial. 
  // IMPORTANTE: Le pasamos 'PUT' como 4to argumento
  const urlParams = `${import.meta.env.VITE_API_BASE_URL}/api/cabins/${cabanaAEditar.id}`;

  const { formData, handleChange, handleSubmit, submitting } = useForm(
    {
      nombre: cabanaAEditar.nombre || cabanaAEditar.nombre || '',
      capacidad_personas: cabanaAEditar.capacidad || cabanaAEditar.capacidad || '',
      precio_noche: cabanaAEditar["Precio noche"] || cabanaAEditar["precio noche"] || '',
      descripcion: cabanaAEditar.descripcion || cabanaAEditar.descripcion || '',
      es_promocion: cabanaAEditar.es_promocion || false,
      precio_promocional: cabanaAEditar.precio_promocional || 0,

      userName: localStorage.getItem('userName') || '',
    },
    urlParams,
    () => {
      // Callback OnSuccess
      fetchData(`${import.meta.env.VITE_API_BASE_URL}/api/cabins`);
      setModalAbierto(false); // Cerramos el modal al tener éxito
    },
    'PUT' // <--- Le decimos a nuestro custom hook que esto es una actualizacion
  );

  return (
    <ModalPlantilla modulo="editar cabaña" onClose={() => setModalAbierto(false)}>
      <Form onSubmit={(e) => handleSubmit(e, () => setModalAbierto(false))}>
        <input 
          type="text" 
          name="nombre" 
          placeholder="Nombre de la cabaña" 
          value={formData.nombre} 
          onChange={handleChange} 
          required 
        />
        <input 
          type="number" 
          min="0"
          name="capacidad_personas" 
          placeholder="Capacidad de personas" 
          value={formData.capacidad_personas} 
          onChange={handleChange} 
          required 
        />
        <input 
          type="number" 
          min="0"
          step="0.01" 
          name="precio_noche" 
          placeholder="Precio por noche" 
          value={formData.precio_noche} 
          onChange={handleChange} 
          required 
        />
        <textarea 
          name="descripcion" 
          placeholder="Descripción de la cabaña" 
          value={formData.descripcion} 
          onChange={handleChange} 
          required 
        />
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input 
            type="checkbox" 
            name="es_promocion" 
            checked={formData.es_promocion} 
            onChange={(e) => handleChange({ target: { name: 'es_promocion', value: e.target.checked } })} 
            style={{ width: 'auto' }}
          />
          ¿Es una Promoción?
        </label>
        {formData.es_promocion && (
          <input 
            type="number" 
            min="0"
            step="0.01" 
            name="precio_promocional" 
            placeholder="Precio Promocional" 
            value={formData.precio_promocional} 
            onChange={handleChange} 
            required 
          />
        )}
        <button type="submit" disabled={submitting}>
          {submitting ? 'Actualizando...' : 'Actualizar Cabaña'}
        </button>
      </Form>
    </ModalPlantilla>
  );
}
