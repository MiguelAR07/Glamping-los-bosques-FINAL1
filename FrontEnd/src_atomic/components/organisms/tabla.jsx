import styled from "styled-components";
import { useState, useEffect } from "react";
import Paginacion from "../molecules/paginacion";

import { formatCurrency, formatDate } from "../../utils/formattersUtil";

const TableWrapper = styled.div`
  width: 100%;
  margin-top: 30px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.05);
  border-radius: 5px;
  background-color: #ffffff;
`;

const OverflowTable = styled.div`
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
  border-radius: 5px 5px 0 0;
`;

const Table = styled.table`
  width: 100%;
  min-width: 1100px;
  border-collapse: collapse;

  th, td{
    padding: 15px 10px;
    text-align: left;
    max-width: 200px;
    overflow: hidden;
    text-overflow: wrap;
    white-space: wrap;
  }

  thead{
    background: #e1e1e1;
    color: #1b1b1b;
  }

  tbody{
    background: #ffffff;
  }

  td.acciones {
    display: flex;
    gap: 10px;
    align-items: center;
    justify-content: center;
  }

  button.accion-btn {
    border: none;
    background: none;
    cursor: pointer;
    font-size: 1.2rem;
    padding: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s;
    
    &:hover {
      transform: scale(1.1);
    }
  }

  button.columnClick {
    background: rgba(45, 120, 0, 0.08);
    color: #2D7800;
    border: 1px solid rgba(45, 120, 0, 0.2);
    padding: 6px 14px;
    border-radius: 20px;
    cursor: pointer;
    font-weight: 600;
    font-size: 0.9rem;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    white-space: nowrap;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    
    &:hover {
      background: rgba(45, 120, 0, 0.15);
      border-color: rgba(45, 120, 0, 0.4);
      transform: translateY(-1px);
      box-shadow: 0 4px 10px rgba(45, 120, 0, 0.1);
    }

    &:active {
      transform: translateY(0);
    }
  }
`;

function TablaGeneral({ data, acciones, onEdit, onDelete, onActive, hideActions, onColumnClick }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // Adjust rows per page for better view

  useEffect(() => {
    setCurrentPage(1); // Reset page on data change (e.g. search)
  }, [data]);

  if (!data || data.length === 0) {
    return <p style={{ marginTop: '20px', color: '#6b7280' }}>No hay datos para mostrar</p>;
  }

  // Se filtran todas las columnas que terminen en _id
  const columnas = Object.keys(data[0]).filter(col => !col.endsWith('_id'));

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(data.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <TableWrapper>
      <OverflowTable>
        <Table>
          <thead>
            <tr>
              {columnas.map((col, i) => (
                <th key={i}>{col}</th>
              ))}
              {(!hideActions && (acciones || onEdit || onDelete || onActive)) && <th>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {currentItems.map((fila, i) => (
              <tr key={i}>
                {columnas.map((col, j) => (
                  <td key={j}>
                    {(() => {
                      const valor = fila[col];
                      const columnasMoneda = ["sueldo", "precio noche", "Pago restante", "monto", "total", "subtotal", "precio", "ingresos_generados"];
                      const columnasFecha = ["actualizacion", "fecha", "fecha_mantenimiento", "fecha_registro", "llegada", "salida"];

                      let formattedValue = valor;
                      if (columnasMoneda.includes(col)) {
                        formattedValue = (valor !== null && valor !== undefined) ? formatCurrency(valor) : "$ 0";
                      } else if (columnasFecha.includes(col)) {
                        formattedValue = (valor !== null && valor !== undefined) ? formatDate(valor) : "N / A";
                      } else if (col === 'img_url') {
                        formattedValue = valor ? <img src={valor} alt="preview" style={{width: '50px', height: '50px', objectFit: 'cover', borderRadius: '5px'}} /> : 'Sin imagen';
                      } else {
                        if (valor === null || valor === undefined) {
                          formattedValue = 'N / A';
                        } else if (Array.isArray(valor)) {
                          formattedValue = valor.map(v => v.nombre || JSON.stringify(v)).join(', ');
                        } else if (typeof valor === 'object') {
                          formattedValue = JSON.stringify(valor);
                        } else {
                          formattedValue = valor;
                        }
                      }

                      if (onColumnClick && onColumnClick[col]) {
                        return (
                          <button 
                            className="columnClick"
                            onClick={() => onColumnClick[col](fila)}
                          >
                            <span>{formattedValue}</span>
                            <i className="bi bi-box-arrow-up-right" style={{ fontSize: '0.75rem', opacity: 0.7 }}></i>
                          </button>
                        );
                      }

                      return formattedValue;
                    })()}
                  </td>
                ))}
                {(!hideActions && (acciones || onEdit || onDelete || onActive)) && (
                  <td className="acciones">
                    {onEdit && (
                      <button
                        className="accion-btn"
                        onClick={() => onEdit(fila)}
                        title="Editar"
                        style={{ color: "#FFC107" }}
                      >
                        <i className="bi bi-pencil-fill" style={{ fontSize: '1.2rem' }}></i>
                      </button>
                    )}
                    {(onDelete && fila.estado !== 'Inactivo') && (
                      <button
                        className="accion-btn"
                        onClick={() => onDelete(fila)}
                        title="Eliminar"
                        style={{ color: "#DC3545" }}
                      >
                        <i className="bi bi-bag-dash-fill" style={{ fontSize: '1.2rem' }}></i>
                      </button>
                    )}
                    {(onActive && fila.estado === 'Inactivo') && (
                      <button
                        className="accion-btn"
                        onClick={() => onActive(fila)}
                        title="Activar"
                        style={{ color: "#28a745" }}
                      >
                        <i className="bi bi-bag-plus-fill" style={{ fontSize: '1.2rem' }}></i>
                      </button>
                    )}
                    {acciones && acciones.map((accion, k) => {
                      if (accion.condition && !accion.condition(fila)) return null;
                      return (
                        <button
                          key={k}
                          className="accion-btn"
                          onClick={() => accion.onClick(fila)}
                          title={accion.title}
                          style={{ color: accion.color || "inherit" }}
                        >
                          {accion.icono}
                        </button>
                      );
                    })}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </Table>
      </OverflowTable>

      <Paginacion
        currentPage={currentPage}
        totalPages={totalPages}
        paginate={paginate}
      />

    </TableWrapper>
  );
}

export default TablaGeneral;