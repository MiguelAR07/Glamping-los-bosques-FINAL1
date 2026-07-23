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
    background-color: #43523A;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-weight: bold;
    &:hover {
      background-color: #2c3825;
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

export default function ModalAgregar({ setModalAbierto, fetchData }) {
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

  const { formData, handleChange, handleSubmit, submitting, setFormData } = useForm(
    { 
      nombre: '', 
      descripcion: '',
      precio: '',
      img_url: '',
      cabanas_ids: [],
      fecha_inicio: '',
      fecha_fin: '',
      dias_estadia: 1,
      userName: localStorage.getItem('userName') || '',
    },
    `${import.meta.env.VITE_API_BASE_URL}/api/promociones`,
    () => {
      fetchData();
      setModalAbierto(false);
    }
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
      if (!file.type.startsWith("image/")) {
        alert("Por favor, sube un archivo de imagen válido.");
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
    <ModalPlantilla modulo="promociones" onClose={() => setModalAbierto(false)}>
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
            <input type="date" name="fecha_fin" value={formData.fecha_fin} min={formData.fecha_inicio} onChange={handleChange} required />
          </div>
        </div>

        <div>
          <label style={{display:'block', marginBottom:'5px', fontWeight:'bold', fontSize:'14px'}}>Sube la imagen (Cualquier formato):</label>
          <input type="file" accept="image/*" onChange={handleImageUpload} required />
          {formData.img_url && (
            <img src={formData.img_url} alt="Preview" style={{marginTop:'10px', maxHeight:'100px', borderRadius:'5px'}} />
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
          {submitting ? 'Guardando...' : 'Guardar Promoción'}
        </button>
      </Form>
    </ModalPlantilla>
  );
}
