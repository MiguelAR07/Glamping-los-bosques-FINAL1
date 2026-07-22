import Swal from 'sweetalert2';

export const activateUtils = {
  activarRegistro: async (modulo, id, nombre, onUpdate) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas activar "${nombre}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, activar',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    try {
      const userName = localStorage.getItem('userName');

      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/${modulo}/activate/${id}`, {
        method: 'PUT',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('token')}`,
          "ngrok-skip-browser-warning": "true"
        },
        body: JSON.stringify({ userName })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.error("Error from server:", res.status, errData);
        Swal.fire({
          title: 'Error',
          text: errData.message || 'Hubo un problema al intentar activar el registro.',
          icon: 'error',
          confirmButtonColor: '#3085d6'
        });
        return;
      }

      Swal.fire({
        title: '¡Activado!',
        text: 'El registro se activó exitosamente.',
        icon: 'success',
        confirmButtonColor: '#3085d6'
      });

      if (onUpdate) {
        onUpdate(`${import.meta.env.VITE_API_BASE_URL}/api/${modulo}`);
      }

    } catch (err) {
      console.error("Error en la petición:", err);
      Swal.fire({
        title: 'Error de Conexión',
        text: 'No se pudo contactar al servidor.',
        icon: 'error',
        confirmButtonColor: '#3085d6'
      });
    }
  }
}