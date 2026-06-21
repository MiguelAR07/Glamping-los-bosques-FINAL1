import { useState } from "react";
import { useFetch } from "./fetchConnect";

/**
 * Hook personalizado para manejar formularios, sus estados y envío al backend
 * reutilizando la lógica base de useFetch internamente.
 * 
 * @param {Object} initialState - El estado con valores iniciales del formulario (ej. { nombre: '', edad: 0 })
 * @param {string} url - El endpoint a donde enviar (POST) los datos
 * @param {Function} onSuccess - Un callback que se ejecuta tras una respuesta HTTP 200/201 éxitosa (ideal para recargar tablas)
 */
import Swal from 'sweetalert2';

export const useForm = (initialState, url, onSuccess, method = 'POST') => {
  const [formData, setFormData] = useState(initialState);
  const { loading: submitting, error: submitError, fetchData: postData } = useFetch();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e, cerrarModal) => {
    if (e && e.preventDefault) e.preventDefault(); 

    try {
      const cleanedData = { ...formData };
      
      const userName = localStorage.getItem('userName');
      if (userName) {
        cleanedData.userName = userName;
      }

      Object.keys(cleanedData).forEach(key => {
        if (key.includes('_id') && cleanedData[key] === '') {
          cleanedData[key] = null;
        }
      });

      const response = await postData(url, {
        method: method,
        body: JSON.stringify(cleanedData)
      });

      if (method === 'POST') {
        setFormData(initialState);
      }

      Swal.fire({
        title: '¡Éxito!',
        text: 'La operación se realizó correctamente.',
        icon: 'success',
        confirmButtonColor: '#3085d6'
      });

      if (cerrarModal) cerrarModal();
      if (onSuccess) onSuccess(response);

    } catch (err) {
      console.error("Error al enviar formulario:", err);
      Swal.fire({
        title: 'Error',
        text: err.message || 'Hubo un problema al procesar la solicitud.',
        icon: 'error',
        confirmButtonColor: '#3085d6'
      });
    }
  };

  return { formData, handleChange, handleSubmit, submitting, submitError, setFormData };
};
