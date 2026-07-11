import styled from "styled-components";

import { useState } from "react";
import { useSearch } from "../../hooks/useSearch";

import SelectBase from "../atoms/select/selectBase";

const Buscador_Filtro = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
  width: 100%;
  max-width: 500px;

  @media (max-width: 768px) {
    max-width: 100%;
  }
`;

const Buscar = styled.div`
  flex: 1;
  min-width: 180px;
  height: 38px;
  position: relative;

  input{
    width: 100%;
    height: 100%;
    padding: 0 0 0 36px;
    background: #D9D9D9;
    border: 0px;
    border-radius: 5px;
    font-size: 0.85rem;
  }

  i{
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    color: #4b4b4b;
    font-size: 0.85rem;
  }
`;

function SearchTemplate({ modulo, placeholder, onResult, options, onFilterChange }) {
  // Convertir a array si no lo es
  const validOptions = Array.isArray(options) ? options : [];

  // Eliminar la propiedad 'selected' para evitar que SelectBase oculte las opciones
  const cleanedOptions = validOptions.map(opt => {
    const { selected, ...rest } = opt;
    return rest;
  });

  // Siempre agregar "Todos" para asegurar que todos los componentes lo tengan
  const finalOptions = cleanedOptions.some(o => o.nombre === "Todos")
    ? cleanedOptions
    : [{ nombre: "Todos" }, ...cleanedOptions];

  const [filter, setFilter] = useState(finalOptions[0]?.nombre || "Todos");
  const { searchTerm, setSearchTerm } = useSearch(modulo, onResult);

  // Manejar el cambio de filtro
  const handleFilterChange = (e) => {
    const newValue = e.target.value;
    setFilter(newValue);
    if (onFilterChange) onFilterChange(newValue);
  };

  return (
    <Buscador_Filtro>
      <Buscar>
        {/* Convertir en un componente =| */}
        <i className="bi bi-search"></i>
        <input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Buscar>
      {finalOptions && finalOptions.length > 0 && (
        <SelectBase 
          options={finalOptions} 
          value={filter} 
          onChange={handleFilterChange} 
        />
      )}
    </Buscador_Filtro>
  );
}

export default SearchTemplate;
