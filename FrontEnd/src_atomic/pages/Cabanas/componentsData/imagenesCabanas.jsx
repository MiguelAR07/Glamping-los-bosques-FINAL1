import styled from "styled-components";
import { useState } from "react";

/**
 * Datos de las imágenes actuales del carrusel del Landing,
 * organizadas por cabaña y en el orden exacto en que aparecen.
 */
const CABIN_IMAGES_DATA = [
  {
    id: "palmas",
    name: "Cabaña Palmas",
    description: "Ideal para parejas, con todas las comodidades de lujo en medio del bosque.",
    images: [
      { order: 1, url: "/cabins/palmas/3.webp", filename: "3.webp" },
      { order: 2, url: "/cabins/palmas/1.webp", filename: "1.webp" },
      { order: 3, url: "/cabins/palmas/2.webp", filename: "2.webp" },
      { order: 4, url: "/cabins/palmas/4.webp", filename: "4.webp" },
      { order: 5, url: "/cabins/palmas/5.webp", filename: "5.webp" },
      { order: 6, url: "/cabins/palmas/6.webp", filename: "6.webp" },
    ]
  },
  {
    id: "bambu",
    name: "Cabaña Bambú",
    description: "Inmersión rústica con acabados en bambú, conexión profunda con la naturaleza.",
    images: [
      { order: 1, url: "/cabins/bambu/3.webp", filename: "3.webp" },
      { order: 2, url: "/cabins/bambu/2.webp", filename: "2.webp" },
      { order: 3, url: "/cabins/bambu/1.webp", filename: "1.webp" },
      { order: 4, url: "/cabins/bambu/4.webp", filename: "4.webp" },
      { order: 5, url: "/cabins/bambu/5.webp", filename: "5.webp" },
      { order: 6, url: "/cabins/bambu/6.webp", filename: "6.webp" },
    ]
  },
  {
    id: "roble",
    name: "Cabaña Roble",
    description: "Madera noble con vistas panorámicas, pozo de fuego y jacuzzi privado.",
    images: [
      { order: 1, url: "/cabins/roble/3.webp", filename: "3.webp" },
      { order: 2, url: "/cabins/roble/2.webp", filename: "2.webp" },
      { order: 3, url: "/cabins/roble/1.webp", filename: "1.webp" },
      { order: 4, url: "/cabins/roble/4.webp", filename: "4.webp" },
      { order: 5, url: "/cabins/roble/5.webp", filename: "5.webp" },
      { order: 6, url: "/cabins/roble/6.webp", filename: "6.webp" },
    ]
  }
];

// ─── Landing base URL ───
// Las imágenes del landing se sirven desde este dominio.
// Si el landing está en otro dominio, ajustar aquí.
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

  @media (max-width: 768px) {
    padding: 10px 14px;
    
    p {
      font-size: 0.8rem;
    }
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

  @media (max-width: 768px) {
    padding: 12px 14px;
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

  @media (max-width: 768px) {
    gap: 10px;

    h4 {
      font-size: 0.9rem;
    }
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

  @media (max-width: 768px) {
    padding: ${props => props.$isOpen ? '0 14px 14px' : '0 14px'};
  }
`;

const CabinDesc = styled.p`
  font-size: 0.8rem;
  color: #6b7280;
  margin-bottom: 14px;
  padding-top: 4px;
`;

const ImagesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 14px;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
    gap: 12px;
  }

  @media (max-width: 600px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
`;

const ImageCard = styled.div`
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  img {
    width: 100%;
    aspect-ratio: 4 / 3;
    object-fit: cover;
    display: block;
  }
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
`;

function ImagenesCabanas() {
  const [openPanels, setOpenPanels] = useState({ palmas: true, bambu: false, roble: false });

  const togglePanel = (cabinId) => {
    setOpenPanels(prev => ({
      ...prev,
      [cabinId]: !prev[cabinId]
    }));
  };

  // Intentar cargar la imagen desde la carpeta local public del landing.
  // Si no funciona, usaremos la URL base del landing desplegado.
  const getImageSrc = (url) => {
    // Las imágenes están en la carpeta public del Landing
    // Intentamos cargar directamente (funciona si están copiadas al panel también)
    return url;
  };

  return (
    <Container>
      <InfoBanner>
        <i className="bi bi-info-circle-fill"></i>
        <p>
          Estas son las imágenes que se muestran en el carrusel del Landing para cada cabaña. 
          Se organizan en el orden en que aparecen al visitante.
        </p>
      </InfoBanner>

      {CABIN_IMAGES_DATA.map(cabin => {
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
              <CabinDesc>{cabin.description}</CabinDesc>
              <ImagesGrid>
                {cabin.images.map((img, idx) => (
                  <ImageCard key={idx}>
                    <OrderBadge>#{img.order}</OrderBadge>
                    <img 
                      src={getImageSrc(img.url)} 
                      alt={`${cabin.name} - Imagen ${img.order}`}
                      loading="lazy"
                      onError={(e) => {
                        // Fallback: intentar desde el landing desplegado
                        if (!e.target.src.includes(LANDING_BASE)) {
                          e.target.src = `${LANDING_BASE}${img.url}`;
                        }
                      }}
                    />
                    <ImageInfo>
                      <span className="filename">{img.filename}</span>
                      <span className="order">Pos. {img.order}</span>
                    </ImageInfo>
                  </ImageCard>
                ))}
              </ImagesGrid>
            </CabinContent>
          </CabinPanel>
        );
      })}
    </Container>
  );
}

export default ImagenesCabanas;
