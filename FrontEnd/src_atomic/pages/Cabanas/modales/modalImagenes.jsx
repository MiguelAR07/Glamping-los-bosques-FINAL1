import styled from "styled-components";
import { useState, useEffect } from "react";
import { useFetch } from "../../../hooks/fetchConnect";

import ModalPlantilla from "../../../components/organisms/Modales/modalPlantilla";

const ContentContainer = styled.div`
  background: #f9f9f9;
  border-radius: 8px;
  padding: 15px;
  margin-top: 20px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 10px;
`;

const ItemCard = styled.div`
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 210px;

  img {
    max-width: 100%;
    border-radius: 5px;
    margin-bottom: 10px;
    max-height: 70px;
    object-fit: cover;
  }
`;

function ModalImagenes({ id, onClose }) {
  const { data, loading, error, fetchData } = useFetch();

  useEffect(() => {
    fetchData(`${import.meta.env.VITE_API_BASE_URL}/api/cabins/images/${id}`);
  }, [id, fetchData]);

  return (
    <ModalPlantilla titulo="Información del Cliente" onClose={onClose}>
      <ContentContainer>
        {loading && <p>Cargando información...</p>}
        {error && <p style={{ color: "red" }}>Error: {error}</p>}

        {!loading &&
          !error &&
          data &&
          (data.length > 0 ? (
            data.map((item) => (
              <ItemCard key={item.id}>
                {item.img_url && <img src={item.img_url} alt={item.producto} />}
                <p>
                  <strong>Producto:</strong> {item.producto || "N/A"}
                </p>
                <p>
                  <strong>Cantidad:</strong> {item.cantidad || "N/A"}
                </p>
              </ItemCard>
            ))
          ) : (
            <p>No hay productos en este paquete.</p>
          ))}
      </ContentContainer>
    </ModalPlantilla>
  );
}

export default ModalImagenes