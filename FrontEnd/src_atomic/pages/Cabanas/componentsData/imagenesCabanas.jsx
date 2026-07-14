import styled from "styled-components";
import { useState, useEffect } from "react";
import { useFetch } from "../../../hooks/fetchConnect";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const LANDING_BASE = "https://glamping-landing.vercel.app";

const Container = styled.div`
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const InfoBanner = styled.div`
  background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
  border: 1px solid #bbf7d0;
  border-radius: 10px;
  padding: 14px 18px;
  display: flex;
  align-items: center;
  gap: 12px;

  i {
    font-size: 1.3rem;
    color: #16a34a;
  }

  p {
    font-size: 0.85rem;
    color: #166534;
    line-height: 1.4;
  }
`;

const CabinPanel = styled.div`
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  border: 1px solid #e5e7eb;
  transition: box-shadow 0.2s;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
`;

const CabinHeader = styled.button`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px;
  background: ${props => props.$isOpen ? '#f8faf8' : '#ffffff'};
  border: none;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #f8faf8;
  }
`;

const CabinTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  .icon-cabin {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    background: #43523A;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
  }

  h4 {
    font-size: 1rem;
    color: #1f2937;
    font-weight: 600;
  }

  span {
    font-size: 0.75rem;
    color: #6b7280;
    background: #f3f4f6;
    padding: 2px 8px;
    border-radius: 10px;
    font-weight: 500;
  }
`;

const ChevronIcon = styled.i`
  font-size: 1rem;
  color: #9ca3af;
  transition: transform 0.3s;
  transform: ${props => props.$isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
`;

const CabinContent = styled.div`
  padding: ${props => props.$isOpen ? '0 18px 18px' : '0 18px'};
  max-height: ${props => props.$isOpen ? '2000px' : '0'};
  overflow: hidden;
  transition: all 0.3s ease-in-out;
  opacity: ${props => props.$isOpen ? '1' : '0'};
`;

const ImagesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 14px;
`;

const ImageCardCont = styled.div`
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  touch-action: none;
  cursor: grab;

  &:active {
    cursor: grabbing;
    box-shadow: 0 8px 16px rgba(0,0,0,0.2);
    z-index: 10;
  }

  img {
    width: 100%;
    aspect-ratio: 4 / 3;
    object-fit: cover;
    display: block;
    pointer-events: none;
  }
`;

const OrderBadge = styled.div`
  position: absolute;
  top: 8px;
  left: 8px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  color: white;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
  z-index: 1;
  pointer-events: none;
`;

const ImageInfo = styled.div`
  padding: 8px 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  span.filename {
    font-size: 0.75rem;
    color: #374151;
    font-weight: 500;
    max-width: 100px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  span.order {
    font-size: 0.7rem;
    color: white;
    background: #43523A;
    padding: 2px 8px;
    border-radius: 10px;
    font-weight: 600;
  }
`;

// Componente Sortable individual
function SortableImage({ image, index, cabinName }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: image.imagen_id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getFilename = (url) => {
    try {
      const parts = url.split('/');
      return parts[parts.length - 1] || 'img.webp';
    } catch {
      return 'img.webp';
    }
  };

  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.includes('/public/cabins/')) {
      const relativePath = url.substring(url.indexOf('/public/cabins/'));
      return relativePath.replace('/public', '');
    }
    return url;
  };

  return (
    <ImageCardCont ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <OrderBadge>#{index + 1}</OrderBadge>
      <img 
        src={getImageUrl(image.img_url)} 
        alt={`${cabinName} - Imagen ${index + 1}`}
        loading="lazy"
        onError={(e) => {
          // Fallback final en caso de que no exista localmente
          if (!e.target.src.includes("glampinglosbosques.com")) {
            e.target.src = `https://glampinglosbosques.com${getImageUrl(image.img_url)}`;
          }
        }}
      />
      <ImageInfo>
        <span className="filename" title={getFilename(image.img_url)}>{getFilename(image.img_url)}</span>
        <i className="bi bi-grip-vertical text-gray-400"></i>
      </ImageInfo>
    </ImageCardCont>
  );
}

function ImagenesCabanas() {
  const [openPanels, setOpenPanels] = useState({});
  const [cabinsData, setCabinsData] = useState([]);
  const [loading, setLoading] = useState(true);

  const { fetchData: fetchCabins } = useFetch();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };

        // Traer cabañas y todas las imágenes (ya ordenadas desde BD)
        const [cabinsRes, imagesRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_BASE_URL}/api/cabins`, { headers }),
          fetch(`${import.meta.env.VITE_API_BASE_URL}/api/cabins/images`, { headers })
        ]);

        const cabins = await cabinsRes.json();
        const allImages = await imagesRes.json();

        // Agrupar
        const formattedData = cabins.map(c => {
          const cImages = allImages.filter(img => img.cabana_id === c.cabana_id);
          return {
            id: c.cabana_id,
            name: c.nombre,
            description: c.descripcion || '',
            images: cImages
          };
        });

        setCabinsData(formattedData);
        
        // Abrir el primer panel por defecto
        if (formattedData.length > 0) {
          setOpenPanels({ [formattedData[0].id]: true });
        }
      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const togglePanel = (cabinId) => {
    setOpenPanels(prev => ({
      ...prev,
      [cabinId]: !prev[cabinId]
    }));
  };

  const handleDragEnd = async (event, cabinId) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      // Encontrar la cabaña
      const cabinIndex = cabinsData.findIndex(c => c.id === cabinId);
      const cabin = cabinsData[cabinIndex];
      
      const oldIndex = cabin.images.findIndex(img => img.imagen_id === active.id);
      const newIndex = cabin.images.findIndex(img => img.imagen_id === over.id);
      
      // Reordenar array visualmente
      const newImages = arrayMove(cabin.images, oldIndex, newIndex);
      
      const newData = [...cabinsData];
      newData[cabinIndex] = { ...cabin, images: newImages };
      setCabinsData(newData);

      // Preparar payload para guardar en BD
      // Se actualizan todas las imágenes de esta cabaña con su nuevo índice como orden
      const payload = newImages.map((img, idx) => ({
        id: img.imagen_id,
        order: idx
      }));

      try {
        const token = localStorage.getItem('token');
        await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/cabins/images/order`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ images: payload })
        });
        console.log("Orden guardado");
      } catch (error) {
        console.error("Error guardando orden:", error);
        alert("Hubo un error al guardar el orden");
      }
    }
  };

  if (loading) return <p style={{ marginTop: '20px' }}>Cargando imágenes...</p>;

  return (
    <Container>
      <InfoBanner>
        <i className="bi bi-info-circle-fill"></i>
        <p>
          Estas son las imágenes que se muestran en el carrusel del Landing. 
          <strong> Arrastra y suelta </strong> cualquier imagen para cambiar su orden de aparición. El orden se guarda automáticamente.
        </p>
      </InfoBanner>

      {cabinsData.map(cabin => {
        const isOpen = openPanels[cabin.id] || false;
        
        return (
          <CabinPanel key={cabin.id}>
            <CabinHeader $isOpen={isOpen} onClick={() => togglePanel(cabin.id)}>
              <CabinTitle>
                <div className="icon-cabin">
                  <i className="bi bi-house-fill"></i>
                </div>
                <h4>{cabin.name}</h4>
                <span>{cabin.images.length} imágenes</span>
              </CabinTitle>
              <ChevronIcon className="bi bi-chevron-down" $isOpen={isOpen} />
            </CabinHeader>

            <CabinContent $isOpen={isOpen}>
              <p style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '14px', paddingTop: '4px' }}>
                {cabin.description}
              </p>
              
              <DndContext 
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={(e) => handleDragEnd(e, cabin.id)}
              >
                <SortableContext 
                  items={cabin.images.map(img => img.imagen_id)}
                  strategy={rectSortingStrategy}
                >
                  <ImagesGrid>
                    {cabin.images.map((img, idx) => (
                      <SortableImage 
                        key={img.imagen_id}
                        image={img}
                        index={idx}
                        cabinName={cabin.name}
                      />
                    ))}
                  </ImagesGrid>
                </SortableContext>
              </DndContext>
              
            </CabinContent>
          </CabinPanel>
        );
      })}
    </Container>
  );
}

export default ImagenesCabanas;
