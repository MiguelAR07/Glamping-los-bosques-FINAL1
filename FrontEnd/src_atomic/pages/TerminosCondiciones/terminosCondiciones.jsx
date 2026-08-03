import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Swal from "sweetalert2";
import { useFetch } from "../../hooks/fetchConnect";

const Container = styled.div`
  padding: 24px;
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #ffffff 0%, #f8fcf8 100%);
  padding: 28px 32px;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(45, 120, 0, 0.05);
  border: 1px solid rgba(45, 120, 0, 0.1);
  margin-bottom: 30px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 20px;
    align-items: flex-start;
  }
`;

const TitleGroup = styled.div`
  h2 {
    color: #1a4700;
    margin: 0 0 6px 0;
    font-size: 1.6rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  p {
    color: #666;
    margin: 0;
    font-size: 0.95rem;
  }
`;

const ModernButton = styled.button`
  background: linear-gradient(135deg, #2D7800 0%, #1a4700 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 15px rgba(45, 120, 0, 0.2);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(45, 120, 0, 0.3);
    background: linear-gradient(135deg, #358c00 0%, #1f5400 100%);
  }

  &:active {
    transform: translateY(0);
  }
`;

const TermsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 24px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const TermCard = styled.div`
  background: white;
  border-radius: 18px;
  padding: 24px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.04);
  border: 1px solid #eef3eb;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 30px rgba(45, 120, 0, 0.1);
    border-color: rgba(45, 120, 0, 0.2);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  gap: 12px;
`;

const TermTitle = styled.h3`
  font-size: 1.15rem;
  font-weight: 700;
  color: #1a4700;
  margin: 0;
  line-height: 1.4;
`;

const CategoryBadge = styled.span`
  background: #eaf5e6;
  color: #2D7800;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 20px;
  white-space: nowrap;
  border: 1px solid rgba(45, 120, 0, 0.15);
`;

const TermContent = styled.p`
  color: #4a5568;
  font-size: 0.95rem;
  line-height: 1.6;
  margin: 0 0 20px 0;
  flex-grow: 1;
  white-space: pre-wrap;
`;

const CardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #f0f4ee;
  padding-top: 16px;
  margin-top: auto;
`;

const LastUpdated = styled.span`
  font-size: 0.8rem;
  color: #888;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const IconButton = styled.button`
  background: ${props => props.$color ? `${props.$color}15` : '#f0f4ee'};
  color: ${props => props.$color || '#555'};
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1rem;

  &:hover {
    background: ${props => props.$color || '#555'};
    color: white;
    transform: scale(1.05);
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 20px;
  padding: 32px;
  width: 100%;
  max-width: 550px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
  animation: fadeIn 0.3s ease;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const ModalTitle = styled.h3`
  margin: 0 0 24px 0;
  font-size: 1.3rem;
  color: #1a4700;
  font-weight: 700;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;

  label {
    display: block;
    font-size: 0.9rem;
    font-weight: 600;
    color: #444;
    margin-bottom: 8px;
  }

  input, textarea, select {
    width: 100%;
    padding: 12px 16px;
    border-radius: 10px;
    border: 1px solid #dcdcdc;
    font-size: 0.95rem;
    outline: none;
    transition: border-color 0.2s ease;

    &:focus {
      border-color: #2D7800;
      box-shadow: 0 0 0 3px rgba(45, 120, 0, 0.1);
    }
  }

  textarea {
    min-height: 120px;
    resize: vertical;
  }
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 28px;
`;

const ButtonSecondary = styled.button`
  background: #f0f0f0;
  color: #555;
  border: none;
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #e2e2e2;
  }
`;

function TerminosCondiciones() {
  const { data: terms, loading, error, fetchData } = useFetch();
  const [modalAbierto, setModalAbierto] = useState(false);
  const [termEditando, setTermEditando] = useState(null);

  const [formData, setFormData] = useState({
    titulo: "",
    contenido: "",
    categoria: "General",
    orden: 1
  });

  const cargarTerminos = () => {
    fetchData(`${import.meta.env.VITE_API_BASE_URL}/api/terms`);
  };

  useEffect(() => {
    cargarTerminos();
  }, [fetchData]);

  const abrirModalNuevo = () => {
    setTermEditando(null);
    setFormData({
      titulo: "",
      contenido: "",
      categoria: "General",
      orden: (terms?.length || 0) + 1
    });
    setModalAbierto(true);
  };

  const abrirModalEditar = (term) => {
    setTermEditando(term);
    setFormData({
      titulo: term.titulo,
      contenido: term.contenido,
      categoria: term.categoria || "General",
      orden: term.orden || 1
    });
    setModalAbierto(true);
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    if (!formData.titulo.trim() || !formData.contenido.trim()) {
      Swal.fire({ icon: 'warning', title: 'Campos requeridos', text: 'Por favor completa el título y contenido.' });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const isEditing = !!termEditando;
      const url = isEditing 
        ? `${import.meta.env.VITE_API_BASE_URL}/api/terms/${termEditando.id}`
        : `${import.meta.env.VITE_API_BASE_URL}/api/terms`;
      
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Error al guardar los términos');
      }

      Swal.fire({
        icon: 'success',
        title: isEditing ? '¡Término actualizado!' : '¡Término registrado!',
        text: 'Los cambios se reflejarán en la landing page y en el sistema.',
        timer: 2000,
        showConfirmButton: false
      });

      setModalAbierto(false);
      cargarTerminos();
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: 'error', title: 'Error', text: err.message || 'No se pudieron guardar los cambios.' });
    }
  };

  const eliminarTermino = async (term) => {
    const result = await Swal.fire({
      title: '¿Eliminar término?',
      text: `Se eliminará "${term.titulo}". Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/terms/${term.id}`, {
        method: 'DELETE',
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error('No se pudo eliminar el término.');
      }

      Swal.fire({
        icon: 'success',
        title: '¡Eliminado!',
        text: 'El término ha sido eliminado exitosamente.',
        timer: 2000,
        showConfirmButton: false
      });

      cargarTerminos();
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: 'error', title: 'Error', text: err.message });
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      return new Intl.DateTimeFormat('es-CO', {
        day: '2-digit', month: 'short', year: 'numeric'
      }).format(new Date(dateStr));
    } catch (e) {
      return '';
    }
  };

  return (
    <Container>
      <HeaderSection>
        <TitleGroup>
          <h2>
            <i className="bi bi-file-text-fill"></i>
            Términos y Condiciones
          </h2>
          <p>Gestiona las normas, políticas de reserva y acuerdos visibles en la landing page y reservas.</p>
        </TitleGroup>
        <ModernButton onClick={abrirModalNuevo}>
          <i className="bi bi-plus-circle-fill"></i>
          Nuevo Término
        </ModernButton>
      </HeaderSection>

      {loading && <p>Cargando términos y condiciones...</p>}
      {error && <p style={{ color: 'red' }}>Error al cargar términos: {error}</p>}

      {terms && terms.length > 0 && (
        <TermsGrid>
          {terms.map((term) => (
            <TermCard key={term.id}>
              <div>
                <CardHeader>
                  <TermTitle>{term.titulo}</TermTitle>
                  <CategoryBadge>{term.categoria || 'General'}</CategoryBadge>
                </CardHeader>
                <TermContent>{term.contenido}</TermContent>
              </div>
              <CardFooter>
                <LastUpdated>
                  <i className="bi bi-clock-history"></i>
                  {formatDate(term.fecha_actualizacion)}
                </LastUpdated>
                <ActionButtons>
                  <IconButton 
                    $color="#2D7800" 
                    title="Editar Término"
                    onClick={() => abrirModalEditar(term)}
                  >
                    <i className="bi bi-pencil-square"></i>
                  </IconButton>
                  <IconButton 
                    $color="#dc3545" 
                    title="Eliminar Término"
                    onClick={() => eliminarTermino(term)}
                  >
                    <i className="bi bi-trash-fill"></i>
                  </IconButton>
                </ActionButtons>
              </CardFooter>
            </TermCard>
          ))}
        </TermsGrid>
      )}

      {modalAbierto && (
        <ModalOverlay onClick={() => setModalAbierto(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalTitle>
              {termEditando ? 'Editar Término o Condición' : 'Nuevo Término o Condición'}
            </ModalTitle>
            <form onSubmit={handleGuardar}>
              <FormGroup>
                <label>Título / Sección *</label>
                <input 
                  type="text"
                  placeholder="Ej: 1. Reservas y Pagos"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  required
                />
              </FormGroup>
              <FormGroup>
                <label>Categoría</label>
                <select
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                >
                  <option value="Reservas">Reservas</option>
                  <option value="Cancelación">Cancelación</option>
                  <option value="Estadía">Estadía</option>
                  <option value="Convivencia">Convivencia</option>
                  <option value="General">General</option>
                </select>
              </FormGroup>
              <FormGroup>
                <label>Contenido del Término *</label>
                <textarea 
                  placeholder="Escribe detalladamente la política o condición..."
                  value={formData.contenido}
                  onChange={(e) => setFormData({ ...formData, contenido: e.target.value })}
                  required
                />
              </FormGroup>
              <FormGroup>
                <label>Orden de visualización</label>
                <input 
                  type="number"
                  min="1"
                  value={formData.orden}
                  onChange={(e) => setFormData({ ...formData, orden: parseInt(e.target.value) || 1 })}
                />
              </FormGroup>
              <ModalActions>
                <ButtonSecondary type="button" onClick={() => setModalAbierto(false)}>
                  Cancelar
                </ButtonSecondary>
                <ModernButton type="submit">
                  <i className="bi bi-check-circle-fill"></i>
                  {termEditando ? 'Guardar Cambios' : 'Crear Término'}
                </ModernButton>
              </ModalActions>
            </form>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
}

export default TerminosCondiciones;
