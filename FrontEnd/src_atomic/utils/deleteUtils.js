import Swal from 'sweetalert2';

export const deleteUtils = {  
  eliminarRegistro: async (modulo, id, nombre, onUpdate) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas desactivar o eliminar "${nombre}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    try {
      const userName = localStorage.getItem('userName');

      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/${modulo}/delete/${id}`, {
        method: 'DELETE',
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
          text: errData.message || 'Hubo un problema al intentar eliminar el registro.',
          icon: 'error',
          confirmButtonColor: '#3085d6'
        });
        return;
      }

      Swal.fire({
        title: '¡Eliminado!',
        text: 'El registro ha sido eliminado con éxito.',
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
        text: 'No se pudo conectar con el servidor.',
        icon: 'error',
        confirmButtonColor: '#3085d6'
      });
    }
  }
}