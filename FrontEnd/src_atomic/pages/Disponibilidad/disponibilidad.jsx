import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import moment from 'moment';
import 'moment/locale/es';
import { useFetch } from '../../hooks/fetchConnect';
import ModalBloqueo from './modales/modalBloqueo';
import ModalReserva from './modales/modalReserva';
import ModalAgregar from '../Reservas/modales/modalAgregar';
import BotonAgregar from "../../components/atoms/buttons/botonAgregar";
import ModalAlerta from "../../components/organisms/Modales/modalAlerta";

moment.locale('es');

/* ========== STYLED COMPONENTS ========== */

const PageWrapper = styled.div`
  padding-bottom: 20px;
`;

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;

  h2 {
    color: #43523A;
    margin: 0;
  }
`;

const CalendarGrid = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  overflow: hidden;
  border: 1px solid #e8e8e8;
`;

const WeekRow = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: #43523A;
  color: white;
  font-weight: 600;
  font-size: 0.85rem;
  text-align: center;
  
  span {
    padding: 10px 4px;
  }
`;

const DaysGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
`;

const DayCell = styled.div`
  min-height: 100px;
  border: 1px solid #f0f0f0;
  padding: 4px;
  cursor: pointer;
  background: ${props => props.$isToday ? '#e8f5e9' : props.$isOtherMonth ? '#fafafa' : '#fff'};
  transition: background 0.15s;
  overflow: hidden;
  position: relative;

  &:hover {
    background: ${props => props.$isToday ? '#d4edda' : '#f5f9f5'};
  }

  @media (max-width: 768px) {
    min-height: 70px;
    padding: 2px;
  }
`;

const DayNumber = styled.div`
  font-size: 0.82rem;
  font-weight: ${props => props.$isToday ? '700' : '500'};
  color: ${props => props.$isOtherMonth ? '#bbb' : props.$isToday ? '#43523A' : '#333'};
  margin-bottom: 3px;
  padding: 2px 6px;
  display: inline-block;
  border-radius: 50%;
  background: ${props => props.$isToday ? '#c8e6c9' : 'transparent'};
  min-width: 24px;
  text-align: center;
`;

const EventPill = styled.div`
  font-size: 0.68rem;
  padding: 2px 6px;
  margin-bottom: 2px;
  border-radius: 4px;
  color: white;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  transition: opacity 0.15s;
  background: ${props => props.$type === 'bloqueo' 
    ? 'linear-gradient(135deg, #c92a2a, #e03131)' 
    : 'linear-gradient(135deg, #43523A, #556B48)'};
  border-left: 3px solid ${props => props.$type === 'bloqueo' ? '#ff8a80' : '#8BC34A'};

  &:hover {
    opacity: 0.85;
  }

  @media (max-width: 768px) {
    font-size: 0.6rem;
    padding: 1px 4px;
  }
`;

const MoreLink = styled.div`
  font-size: 0.65rem;
  color: #43523A;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
  padding: 1px 6px;

  &:hover {
    color: #2D7800;
  }
`;

const MorePopup = styled.div`
  position: fixed;
  background: white;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  border: 1px solid #e0e0e0;
  padding: 12px;
  z-index: 9999;
  min-width: 220px;
  max-width: 300px;
  max-height: 250px;
  overflow-y: auto;

  h4 {
    margin: 0 0 8px 0;
    font-size: 0.85rem;
    color: #43523A;
    border-bottom: 1px solid #eee;
    padding-bottom: 6px;
  }
`;

const LegendBar = styled.div`
  display: flex;
  gap: 20px;
  margin-top: 12px;
  padding: 10px 15px;
  background: #fafafa;
  border-radius: 8px;
  font-size: 0.8rem;
  color: #555;
`;

const LegendDot = styled.span`
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 3px;
  margin-right: 6px;
  vertical-align: middle;
  background: ${props => props.$color};
`;

/* ========== COMPONENTE PRINCIPAL ========== */

function ModalSeleccionAccion({ setModalAbierto, onBloquear, onReservar, dateStr }) {
  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'white', padding: '30px', borderRadius: '12px', minWidth: '300px', textAlign: 'center' }}>
        <h3 style={{ marginTop: 0, color: '#43523A', marginBottom: '20px' }}>Opciones para {dateStr}</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <button 
            onClick={onReservar}
            style={{ padding: '12px', background: '#43523A', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            <i className="bi bi-calendar-check-fill" style={{marginRight: '8px'}}></i> Generar Reserva
          </button>
          <button 
            onClick={onBloquear}
            style={{ padding: '12px', background: '#c92a2a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            <i className="bi bi-lock-fill" style={{marginRight: '8px'}}></i> Bloquear Fecha
          </button>
          <button 
            onClick={() => setModalAbierto(false)}
            style={{ padding: '10px', background: '#ccc', color: '#333', border: 'none', borderRadius: '8px', cursor: 'pointer', marginTop: '10px' }}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

function Disponibilidad() {
  const [rawEvents, setRawEvents] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalReservaAbierto, setModalReservaAbierto] = useState(false);
  const [modalAccionAbierto, setModalAccionAbierto] = useState(false);
  const [modalAgregarAbierto, setModalAgregarAbierto] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [cabanas, setCabanas] = useState([]);
  const [selectedDates, setSelectedDates] = useState(null);
  const [currentDate, setCurrentDate] = useState(moment());
  const [morePopup, setMorePopup] = useState(null); // { x, y, date, events }

  const [alertaConfig, setAlertaConfig] = useState({ isOpen: false, message: '', type: 'alert', isError: false, onConfirm: null, onCancel: null });

  const { data, loading, fetchData } = useFetch();

  const loadEvents = () => {
    fetchData(`${import.meta.env.VITE_API_BASE_URL}/api/availability`);
  };

  const loadCabanas = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/cabins`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const cabData = await res.json();
      setCabanas(cabData || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadEvents();
    loadCabanas();
  }, [fetchData]);

  useEffect(() => {
    if (data && Array.isArray(data)) {
      setRawEvents(data);
    }
  }, [data]);

  // Cerrar popup al hacer click fuera
  useEffect(() => {
    const close = () => setMorePopup(null);
    if (morePopup) {
      document.addEventListener('click', close);
      return () => document.removeEventListener('click', close);
    }
  }, [morePopup]);

  // Construir la grilla del mes
  const calendarDays = useMemo(() => {
    const startOfMonth = currentDate.clone().startOf('month');
    const endOfMonth = currentDate.clone().endOf('month');
    const startOfGrid = startOfMonth.clone().startOf('week');
    const endOfGrid = endOfMonth.clone().endOf('week');

    const days = [];
    const cursor = startOfGrid.clone();
    while (cursor.isSameOrBefore(endOfGrid, 'day')) {
      days.push(cursor.clone());
      cursor.add(1, 'day');
    }
    return days;
  }, [currentDate]);

  // Mapear eventos por día
  const eventsByDay = useMemo(() => {
    const map = {};
    rawEvents.forEach(item => {
      const start = moment(item.start).startOf('day');
      const end = moment(item.end).startOf('day');
      const cursor = start.clone();
      while (cursor.isSameOrBefore(end, 'day')) {
        const key = cursor.format('YYYY-MM-DD');
        if (!map[key]) map[key] = [];
        map[key].push({
          id: item.id,
          title: item.title,
          cabana: item.cabana_nombre,
          type: item.tipo,
          cabana_id: item.cabana_id,
          start: item.start,
          end: item.end
        });
        cursor.add(1, 'day');
      }
    });
    return map;
  }, [rawEvents]);

  const MAX_VISIBLE = 2;

  const handleEventClick = (e, evt) => {
    e.stopPropagation();
    if (evt.type === 'bloqueo') {
      setAlertaConfig({
        isOpen: true,
        type: 'confirm',
        message: `¿Deseas eliminar el bloqueo "${evt.title} (${evt.cabana})"?`,
        onCancel: () => setAlertaConfig(prev => ({ ...prev, isOpen: false })),
        onConfirm: async () => {
          setAlertaConfig(prev => ({ ...prev, isOpen: false }));
          try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/availability/block/${evt.id}`, {
              method: 'DELETE',
              headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
              loadEvents();
            } else {
              setAlertaConfig({ isOpen: true, type: 'alert', isError: true, message: "Error al eliminar el bloqueo", onConfirm: () => setAlertaConfig(prev => ({ ...prev, isOpen: false })) });
            }
          } catch (error) {
            console.error(error);
          }
        }
      });
    } else {
      setSelectedEvent({
        id: evt.id,
        title: `${evt.title} (${evt.cabana})`,
        start: new Date(evt.start),
        end: new Date(evt.end),
        type: evt.type,
        cabana_id: evt.cabana_id
      });
      setModalReservaAbierto(true);
    }
  };

  const handleDayClick = (day) => {
    setSelectedDates({ start: day.toDate(), end: day.clone().add(1, 'day').toDate() });
    setModalAccionAbierto(true);
  };

  const handleShowMore = (e, day, dayEvents) => {
    e.stopPropagation();
    const rect = e.target.getBoundingClientRect();
    setMorePopup({
      x: Math.min(rect.left, window.innerWidth - 280),
      y: rect.bottom + 5,
      date: day.format('DD [de] MMMM'),
      events: dayEvents
    });
  };

  const handlePrevMonth = () => setCurrentDate(prev => prev.clone().subtract(1, 'month'));
  const handleNextMonth = () => setCurrentDate(prev => prev.clone().add(1, 'month'));

  const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const today = moment();

  return (
    <PageWrapper>
      <HeaderContainer>
        <h2>Calendario de Disponibilidad</h2>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <button 
            onClick={handlePrevMonth}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#43523A', fontSize: '1.2rem' }}
            title="Mes anterior"
          >
            <i className="bi bi-chevron-left"></i>
          </button>
          
          <span style={{ fontWeight: 'bold', color: '#43523A', fontSize: '1.1rem', textTransform: 'capitalize', minWidth: '150px', textAlign: 'center' }}>
            {currentDate.format('MMMM YYYY')}
          </span>

          <button 
            onClick={handleNextMonth}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#43523A', fontSize: '1.2rem' }}
            title="Mes siguiente"
          >
            <i className="bi bi-chevron-right"></i>
          </button>
          
          <BotonAgregar
            modulo={"Bloquear Fechas"}
            color={1}
            onClick={() => {
              setSelectedDates(null);
              setModalAbierto(true);
            }}
          />
        </div>
      </HeaderContainer>

      {loading && <p>Cargando disponibilidad...</p>}

      <CalendarGrid>
        <WeekRow>
          {weekDays.map(d => <span key={d}>{d}</span>)}
        </WeekRow>
        <DaysGrid>
          {calendarDays.map((day, i) => {
            const key = day.format('YYYY-MM-DD');
            const dayEvents = eventsByDay[key] || [];
            const isToday = day.isSame(today, 'day');
            const isOtherMonth = !day.isSame(currentDate, 'month');
            const visibleEvents = dayEvents.slice(0, MAX_VISIBLE);
            const hiddenCount = dayEvents.length - MAX_VISIBLE;

            return (
              <DayCell
                key={i}
                $isToday={isToday}
                $isOtherMonth={isOtherMonth}
                onClick={() => handleDayClick(day)}
              >
                <DayNumber $isToday={isToday} $isOtherMonth={isOtherMonth}>
                  {day.date()}
                </DayNumber>
                {visibleEvents.map((evt, j) => (
                  <EventPill
                    key={j}
                    $type={evt.type}
                    title={`${evt.type === 'bloqueo' ? '🔒 ' : ''}${evt.title} (${evt.cabana})`}
                    onClick={(e) => handleEventClick(e, evt)}
                  >
                    {evt.type === 'bloqueo' ? '🔒 ' : ''}{evt.title}
                  </EventPill>
                ))}
                {hiddenCount > 0 && (
                  <MoreLink onClick={(e) => handleShowMore(e, day, dayEvents)}>
                    +{hiddenCount} más
                  </MoreLink>
                )}
              </DayCell>
            );
          })}
        </DaysGrid>
      </CalendarGrid>

      <LegendBar>
        <span><LegendDot $color="#43523A" />Reserva</span>
        <span><LegendDot $color="#c92a2a" />Bloqueo</span>
      </LegendBar>

      {/* Popup de "+X más" */}
      {morePopup && (
        <MorePopup 
          style={{ top: morePopup.y, left: morePopup.x }}
          onClick={e => e.stopPropagation()}
        >
          <h4>{morePopup.date}</h4>
          {morePopup.events.map((evt, i) => (
            <EventPill
              key={i}
              $type={evt.type}
              style={{ marginBottom: '4px' }}
              onClick={(e) => handleEventClick(e, evt)}
            >
              {evt.type === 'bloqueo' ? '🔒 ' : ''}{evt.title} ({evt.cabana})
            </EventPill>
          ))}
        </MorePopup>
      )}

      {modalAbierto && (
        <ModalBloqueo
          setModalAbierto={setModalAbierto}
          fetchData={loadEvents}
          cabanas={cabanas}
          initialDates={selectedDates}
        />
      )}

      {modalAgregarAbierto && (
        <ModalAgregar
          setModalAbierto={setModalAgregarAbierto}
          fetchData={loadEvents}
          initialDates={selectedDates}
        />
      )}

      {modalAccionAbierto && (
        <ModalSeleccionAccion
          setModalAbierto={setModalAccionAbierto}
          dateStr={moment(selectedDates?.start).format('DD/MM/YYYY')}
          onBloquear={() => {
            setModalAccionAbierto(false);
            setModalAbierto(true);
          }}
          onReservar={() => {
            setModalAccionAbierto(false);
            setModalAgregarAbierto(true);
          }}
        />
      )}

      {modalReservaAbierto && (
        <ModalReserva
          setModalAbierto={setModalReservaAbierto}
          event={selectedEvent}
          fetchData={loadEvents}
        />
      )}

      <ModalAlerta 
        isOpen={alertaConfig.isOpen}
        message={alertaConfig.message}
        type={alertaConfig.type}
        isError={alertaConfig.isError}
        onConfirm={alertaConfig.onConfirm}
        onCancel={alertaConfig.onCancel}
      />
    </PageWrapper>
  );
}

export default Disponibilidad;
