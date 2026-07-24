import styled from "styled-components";
import { useState, useEffect } from "react";
import Paginacion from "../molecules/paginacion";

import { formatCurrency, formatDate, formatDateTime } from "../../utils/formattersUtil";

const TableWrapper = styled.div`
  width: 100%;
  margin-top: 30px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.05);
  border-radius: 5px;
  background-color: #ffffff;

  @media (max-width: 768px) {
    margin-top: 20px;
  }
`;

const OverflowTable = styled.div`
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
  border-radius: 5px 5px 0 0;
  -webkit-overflow-scrolling: touch;
`;

const Table = styled.table`
  width: 100%;
  min-width: 700px;
  border-collapse: collapse;

  th, td{
    padding: 12px 10px;
    text-align: left;
    max-width: 280px;
    white-space: normal;
    word-break: break-word;
    font-size: 0.85rem;
  }

  th {
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  thead{
    background: #e1e1e1;
    color: #1b1b1b;
  }

  tbody{
    background: #ffffff;
  }

  tbody tr {
    border-bottom: 1px solid #f0f0f0;
    transition: background-color 0.15s;

    &:hover {
      background-color: #fafafa;
    }

    &.row-success {
      background-color: #e6f6eb;
      &:hover {
        background-color: #d4eedb;
      }
    }
  }

  td.acciones {
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: center;
  }

  button.accion-btn {
    border: none;
    background: none;
    cursor: pointer;
    font-size: 1.1rem;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s;
    
    &:hover {
      transform: scale(1.1);
    }
  }

  button.columnClick {
    background: linear-gradient(135deg, #f2fbf4 0%, #e6f6eb 100%);
    color: #1a4700;
    border: 1px solid #c3e6cb;
    padding: 4px 10px;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    font-size: 0.75rem;
    transition: all 0.2s ease;
    white-space: nowrap;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    box-shadow: 0 1px 2px rgba(45, 120, 0, 0.05);
    
    &:hover {
      background: linear-gradient(135deg, #e6f6eb 0%, #d4eedb 100%);
      border-color: #2D7800;
      color: #2D7800;
      transform: translateY(-1px);
      box-shadow: 0 3px 8px rgba(45, 120, 0, 0.15);
    }

    &:active {
      transform: translateY(0);
    }
  }

  @media (max-width: 1024px) {
    min-width: 600px;

    th, td {
      padding: 10px 8px;
      font-size: 0.8rem;
      max-width: 150px;
    }
  }

  @media (max-width: 768px) {
    min-width: 500px;

    th, td {
      padding: 8px 6px;
      font-size: 0.75rem;
      max-width: 120px;
    }
  }
`;

function TablaGeneral({ data, acciones, onEdit, onDelete, onActive, hideActions, onColumnClick, selectable, onSelectionChange, selectedRows = [], hiddenColumns = [], columnMapping = {}, rowClassNameCondition }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      onSelectionChange && onSelectionChange(currentItems);
    } else {
      onSelectionChange && onSelectionChange([]);
    }
  };

  const handleSelectRow = (fila, checked) => {
    if (checked) {
      onSelectionChange && onSelectionChange([...selectedRows, fila]);
    } else {
      onSelectionChange && onSelectionChange(selectedRows.filter(r => r.id !== fila.id && r.reserva_id !== fila.reserva_id));
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [data]);

  if (!data || data.length === 0) {
    return <p style={{ marginTop: '20px', color: '#6b7280' }}>No hay datos para mostrar</p>;
  }

  const columnas = Object.keys(data[0]).filter(col => 
    !col.endsWith('_id') && 
    !hiddenColumns.includes(col) && 
    !col.toLowerCase().includes('recordatorio')
  );

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
              {selectable && (
                <th style={{ width: '40px' }}>
                  <input 
                    type="checkbox" 
                    onChange={handleSelectAll}
                    checked={currentItems.length > 0 && selectedRows.length === currentItems.length}
                  />
                </th>
              )}
              {columnas.map((col, i) => (
                <th key={i}>{columnMapping[col] || col}</th>
              ))}
              {(!hideActions && (acciones || onEdit || onDelete || onActive)) && <th>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {currentItems.map((fila, i) => (
              <tr key={i} className={rowClassNameCondition ? rowClassNameCondition(fila) : ''}>
                {selectable && (
                  <td>
                    <input 
                      type="checkbox" 
                      onChange={(e) => handleSelectRow(fila, e.target.checked)}
                      checked={selectedRows.some(r => (r.id && r.id === fila.id) || (r.reserva_id && r.reserva_id === fila.reserva_id))}
                    />
                  </td>
                )}
                {columnas.map((col, j) => (
                  <td key={j}>
                    {(() => {
                      const valor = fila[col];
                      const columnasMoneda = ["sueldo", "precio noche", "Pago restante", "monto", "total", "subtotal", "precio", "ingresos_generados", "Debe", "Total Restante"];
                      const columnasFecha = ["actualizacion", "fecha", "fecha_mantenimiento", "fecha_registro"];
                      const columnasFechaHora = ["fecha_registro", "llegada", "salida"];

                      let formattedValue = valor;
                      if (columnasMoneda.includes(col)) {
                        formattedValue = (valor !== null && valor !== undefined) ? formatCurrency(valor) : "$ 0";
                      } else if (columnasFechaHora.includes(col)) {
                        formattedValue = (valor !== null && valor !== undefined) ? formatDateTime(valor) : "N / A";
                      } else if (columnasFecha.includes(col)) {
                        formattedValue = (valor !== null && valor !== undefined) ? formatDate(valor) : "N / A";
                      } else if (col === 'Huéspedes' || col === 'Huespedes' || col === 'Adultos') {
                        const adultMatch = typeof valor === 'string' ? valor.match(/(\d+)\s*(?:Ad|Adulto)/i) : null;
                        const childMatch = typeof valor === 'string' ? valor.match(/(\d+)\s*(?:Ni|Niño)/i) : null;
                        const petMatch = typeof valor === 'string' ? valor.match(/(\d+)\s*(?:Mas|Mascota)/i) : null;

                        const a = fila.adultos !== undefined && fila.adultos !== null ? Number(fila.adultos) : (adultMatch ? Number(adultMatch[1]) : 0);
                        const n = fila.ninos !== undefined && fila.ninos !== null ? Number(fila.ninos) : (childMatch ? Number(childMatch[1]) : 0);
                        const m = fila.mascotas !== undefined && fila.mascotas !== null ? Number(fila.mascotas) : (petMatch ? Number(petMatch[1]) : 0);

                        formattedValue = (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', whiteSpace: 'normal', minWidth: '140px', padding: '2px 0' }}>
                            <span style={{ fontWeight: '600', color: '#1e293b', fontSize: '0.82rem' }}>
                              👤 {a} {a === 1 ? 'Adulto' : 'Adultos'}
                            </span>
                            <span style={{ color: n > 0 ? '#475569' : '#94a3b8', fontSize: '0.78rem' }}>
                              👶 {n} {n === 1 ? 'Niño' : 'Niños'}
                            </span>
                            <span style={{ color: m > 0 ? '#d97706' : '#94a3b8', fontSize: '0.78rem', fontWeight: m > 0 ? '600' : 'normal' }}>
                              🐾 {m} {m === 1 ? 'Mascota' : 'Mascotas'}
                            </span>
                          </div>
                        );
                      } else if (col === 'img_url') {
                        formattedValue = valor ? <img src={valor} alt="preview" style={{width: '40px', height: '40px', objectFit: 'cover', borderRadius: '5px'}} /> : 'Sin imagen';
                      } else if (col === 'comprobante') {
                        const fileUrl = valor && valor.startsWith('http') ? valor : `${import.meta.env.VITE_API_BASE_URL}/${valor && valor.replace(/\\/g, '/')}`;
                        formattedValue = valor ? (
                          <a 
                            href={fileUrl} 
                            target="_blank" 
                            rel="noreferrer" 
                            style={{
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              gap: '5px', 
                              padding: '4px 8px', 
                              backgroundColor: '#e6f6eb', 
                              color: '#1a4700', 
                              borderRadius: '5px', 
                              textDecoration: 'none', 
                              fontWeight: 'bold',
                              fontSize: '0.8rem'
                            }}
                          >
                            <i className="bi bi-file-earmark-text"></i> Ver
                          </a>
                        ) : 'N / A';
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
                            <i className="bi bi-box-arrow-up-right" style={{ fontSize: '0.7rem', opacity: 0.7 }}></i>
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
                        <i className="bi bi-pencil-fill" style={{ fontSize: '1.1rem' }}></i>
                      </button>
                    )}
                    {(onDelete && fila.estado !== 'Inactivo') && (
                      <button
                        className="accion-btn"
                        onClick={() => onDelete(fila)}
                        title="Desactivar / Eliminar"
                        style={{ color: "#DC3545" }}
                      >
                        <i className="bi bi-trash-fill" style={{ fontSize: '1.1rem' }}></i>
                      </button>
                    )}
                    {(onActive && fila.estado === 'Inactivo') && (
                      <button
                        className="accion-btn"
                        onClick={() => onActive(fila)}
                        title="Activar"
                        style={{ color: "#28a745" }}
                      >
                        <i className="bi bi-arrow-counterclockwise" style={{ fontSize: '1.1rem' }}></i>
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