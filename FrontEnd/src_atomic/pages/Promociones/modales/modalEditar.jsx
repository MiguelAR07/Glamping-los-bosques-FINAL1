import ModalPlantilla from "../../../components/organisms/Modales/modalPlantilla";
import { useForm } from "../../../hooks/useForm";
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
    background-color: #4A90E2;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-weight: bold;
    &:hover {
      background-color: #357ABD;
    }
  }

  .checkbox-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
    border: 1px solid #ccc;
    padding: 10px;
    border-radius: 5px;
    max-height: 150px;
    overflow-y: auto;
  }

  .checkbox-item {
    display: flex;
    align-items: center;
    gap: 10px;
    input {
      width: auto;
    }
  }
`;

export default function ModalEditar({ setModalAbierto, fetchData, promocionAEditar }) {
  const [cabanasList, setCabanasList] = useState([]);
  const { data: cabanasData, fetchData: fetchCabanas } = useFetch();

  useEffect(() => {
    fetchCabanas(`${import.meta.env.VITE_API_BASE_URL}/api/cabins`);
  }, []);

  useEffect(() => {
    if (cabanasData) {
      setCabanasList(cabanasData);
    }
  }, [cabanasData]);

  // promocionAEditar.cabanas es un array de objetos o JSON string si no se parseó bien.
  let initCabanasIds = [];
  try {
    const cabArray = typeof promocionAEditar.cabanas === 'string' ? JSON.parse(promocionAEditar.cabanas) : promocionAEditar.cabanas;
    if (Array.isArray(cabArray)) {
      initCabanasIds = cabArray.map(c => c.id);
    }
  } catch (e) {
    console.error(e);
  }

  const { formData, handleChange, handleSubmit, submitting, setFormData } = useForm(
    { 
      nombre: promocionAEditar.nombre || '', 
      descripcion: promocionAEditar.descripcion || '',
      precio: promocionAEditar.precio || '',
      img_url: promocionAEditar.img_url || '',
      cabanas_ids: initCabanasIds,
      fecha_inicio: promocionAEditar.fecha_inicio ? promocionAEditar.fecha_inicio.substring(0,10) : '',
      fecha_fin: promocionAEditar.fecha_fin ? promocionAEditar.fecha_fin.substring(0,10) : '',
      dias_estadia: promocionAEditar.dias_estadia !== undefined ? promocionAEditar.dias_estadia : 1,
      userName: localStorage.getItem('userName') || '',
    },
    `${import.meta.env.VITE_API_BASE_URL}/api/promociones/${promocionAEditar.id}`,
    () => {
      fetchData();
      setModalAbierto(false);
    },
    'PUT'
  );

  const handleCheckboxChange = (id) => {
    setFormData((prev) => {
      const isSelected = prev.cabanas_ids.includes(id);
      return {
        ...prev,
        cabanas_ids: isSelected 
          ? prev.cabanas_ids.filter((c_id) => c_id !== id)
          : [...prev.cabanas_ids, id]
      };
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== "image/png") {
        alert("Por favor, sube únicamente imágenes en formato PNG.");
        e.target.value = "";
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          img_url: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <ModalPlantilla modulo="editar promoción" onClose={() => setModalAbierto(false)}>
      <Form onSubmit={(e) => handleSubmit(e, () => setModalAbierto(false))}>
        <input type="text" name="nombre" placeholder="Nombre de la promoción" value={formData.nombre} onChange={handleChange} required />
        <textarea name="descripcion" placeholder="Descripción" value={formData.descripcion} onChange={handleChange} required />
        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ flex: 1 }}>
            <input type="number" step="0.01" name="precio" placeholder="Precio especial" value={formData.precio} onChange={handleChange} required />
          </div>
          <div style={{ flex: 1 }}>
            <input type="number" name="dias_estadia" placeholder="Días de estadía (ej: 1)" value={formData.dias_estadia} onChange={handleChange} min="0" required />
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ flex: 1 }}>
            <label style={{display:'block', marginBottom:'5px', fontWeight:'bold', fontSize:'14px'}}>Fecha Inicio:</label>
            <input type="date" name="fecha_inicio" value={formData.fecha_inicio} onChange={handleChange} required />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{display:'block', marginBottom:'5px', fontWeight:'bold', fontSize:'14px'}}>Fecha Fin (Límite):</label>
            <input type="date" name="fecha_fin" value={formData.fecha_fin} onChange={handleChange} required />
          </div>
        </div>

        <div>
          <label style={{display:'block', marginBottom:'5px', fontWeight:'bold', fontSize:'14px'}}>Sube una nueva imagen (Solo PNG, opcional si ya tiene):</label>
          <input type="file" accept=".png, image/png" onChange={handleImageUpload} />
          {formData.img_url && (
            <div style={{marginTop:'10px'}}>
              <span style={{fontSize:'12px', display:'block', marginBottom:'5px'}}>Vista previa:</span>
              <img src={formData.img_url.startsWith('data:') || formData.img_url.startsWith('http') ? formData.img_url : ''} alt="Preview" style={{maxHeight:'100px', borderRadius:'5px'}} />
            </div>
          )}
        </div>
        
        <div>
          <strong>Selecciona las cabañas participantes:</strong>
          <div className="checkbox-group mt-2">
            {cabanasList.map(cabana => (
              <label key={cabana.id} className="checkbox-item">
                <input 
                  type="checkbox" 
                  checked={formData.cabanas_ids.includes(cabana.id)}
                  onChange={() => handleCheckboxChange(cabana.id)}
                />
                {cabana.nombre}
              </label>
            ))}
            {cabanasList.length === 0 && <span style={{fontSize:'12px', color:'#777'}}>Cargando cabañas...</span>}
          </div>
        </div>

        <button type="submit" disabled={submitting}>
          {submitting ? 'Actualizando...' : 'Actualizar Promoción'}
        </button>
      </Form>
    </ModalPlantilla>
  );
}
