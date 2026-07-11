import styled from "styled-components";

const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #ffffff;
  border-top: 1px solid #eaeaea;
  border-radius: 0 0 5px 5px;
  flex-wrap: wrap;
  gap: 8px;

  button {
    padding: 6px 14px;
    border: 1px solid #d1d5db;
    background-color: #ffffff;
    color: #374151;
    cursor: pointer;
    border-radius: 6px;
    font-weight: 500;
    font-size: 0.8rem;
    transition: all 0.2s;

    &:hover:not(:disabled) {
      background-color: #f3f4f6;
      border-color: #9ca3af;
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.5;
      background-color: #f9fafb;
    }
  }

  span {
    font-size: 0.8rem;
    color: #4b5563;
    font-weight: 500;
  }

  @media (max-width: 768px) {
    padding: 10px 12px;
    justify-content: center;

    button {
      padding: 6px 10px;
      font-size: 0.75rem;
    }

    span {
      font-size: 0.75rem;
      width: 100%;
      text-align: center;
      order: -1;
    }
  }
`;

function Paginacion({ currentPage, totalPages, paginate }) {
  if (totalPages <= 1) return null;

  return (
    <PaginationContainer>
      <button
        onClick={() => paginate(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <i className="bi bi-chevron-left" style={{ marginRight: '4px' }}></i>
        Anterior
      </button>
      <span>Página {currentPage} de {totalPages}</span>
      <button
        onClick={() => paginate(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Siguiente
        <i className="bi bi-chevron-right" style={{ marginLeft: '4px' }}></i>
      </button>
    </PaginationContainer>
  );
}

export default Paginacion;
