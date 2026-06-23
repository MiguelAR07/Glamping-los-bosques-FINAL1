import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/es';
import { momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useFetch } from '../../hooks/fetchConnect';
import ModalBloqueo from './modales/modalBloqueo';
import ModalReserva from './modales/modalReserva';
import BotonAgregar from "../../components/atoms/buttons/botonAgregar";
import ModalAlerta from "../../components/organisms/Modales/modalAlerta";

moment.locale('es');
const localizer = momentLocalizer(moment);

const Container = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  height: 80vh;
  margin-top: 20px;

  .rbc-calendar {
    font-family: inherit;
  }

  /* Fijar filas del mes para que todas tengan la misma altura */
  .rbc-month-view {
    border: 1px solid #ddd;
    border-radius: 8px;
    overflow: hidden;
  }

  .rbc-month-row {
    overflow: hidden !important;
    min-height: 90px;
    max-height: 120px;
  }

  .rbc-row-content {
    overflow: hidden;
    max-height: 100%;
  }

  /* Hacer los eventos más compactos */
  .rbc-event {
    border-radius: 4px;
    padding: 1px 5px;
    font-size: 0.72rem;
    font-weight: 500;
    box-shadow: 0 1px 2px rgba(0,0,0,0.1);
    margin-bottom: 1px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.4;
    height: auto !important;
    max-height: 20px;
  }

  .rbc-event-content {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 0.72rem;
  }

  .rbc-event:hover {
    box-shadow: 0 2px 6px rgba(0,0,0,0.25);
    z-index: 5;
  }

  /* Estilos de reservas vs bloqueos */
  .event-reserva {
    background: linear-gradient(135deg, #43523A, #556B48);
    border: none;
    border-left: 3px solid #8BC34A;
  }
  .event-bloqueo {
    background: linear-gradient(135deg, #c92a2a, #e03131);
    border: none;
    border-left: 3px solid #ff8a80;
  }

  /* Enlace de "+X más" */
  .rbc-show-more {
    font-size: 0.7rem;
    font-weight: 600;
    color: #43523A;
    background: transparent;
    text-decoration: underline;
    margin-top: 2px;
  }

  /* Encabezados de día */
  .rbc-header {
    padding: 8px 4px;
    font-weight: 600;
    font-size: 0.85rem;
    color: #43523A;
    background: #f8f9fa;
    border-bottom: 2px solid #e0e0e0;
  }

  /* Día actual */
  .rbc-today {
    background-color: #e8f5e9;
    border: 2px solid #43523A !important;
  }
  
  .rbc-today .rbc-button-link {
    font-weight: bold;
    color: #43523A;
    font-size: 1.1em;
    background-color: #c8e6c9;
    border-radius: 50%;
    width: 28px;
    height: 28px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-top: 4px;
  }

  /* Numero del día */
  .rbc-date-cell {
    padding: 4px 6px;
    font-size: 0.85rem;
  }

  /* Fila de segmentos de eventos */
  .rbc-row-segment {
    padding: 0 2px;
  }
`;

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  h2 {
    color: #43523A;
    margin: 0;
  }
`;

function Disponibilidad() {
  const [events, setEvents] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalReservaAbierto, setModalReservaAbierto] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [cabanas, setCabanas] = useState([]);
  const [selectedDates, setSelectedDates] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());

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
      const data = await res.json();
      setCabanas(data || []);
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
      const formattedEvents = data.map(item => ({
        id: item.id,
        title: `${item.tipo === 'bloqueo' ? 'Bloqueo: ' : ''}${item.title} (${item.cabana_nombre})`,
        start: new Date(item.start),
        end: new Date(item.end),
        type: item.tipo,
        cabana_id: item.cabana_id
      }));
      setEvents(formattedEvents);
    }
  }, [data]);

  const handleSelectSlot = ({ start, end }) => {
    setSelectedDates({ start, end });
    setModalAbierto(true);
  };

  const handleSelectEvent = async (event) => {
    if (event.type === 'bloqueo') {
      setAlertaConfig({
        isOpen: true,
        type: 'confirm',
        message: `¿Deseas eliminar el bloqueo "${event.title}"?`,
        onCancel: () => setAlertaConfig({ ...alertaConfig, isOpen: false }),
        onConfirm: async () => {
          setAlertaConfig({ ...alertaConfig, isOpen: false });
          try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/availability/block/${event.id}`, {
              method: 'DELETE',
              headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
              loadEvents();
            } else {
              setAlertaConfig({ isOpen: true, type: 'alert', isError: true, message: "Error al eliminar el bloqueo", onConfirm: () => setAlertaConfig({ ...alertaConfig, isOpen: false }) });
            }
          } catch (error) {
            console.error(error);
          }
        }
      });
    } else {
      setSelectedEvent(event);
      setModalReservaAbierto(true);
    }
  };

  const eventPropGetter = (event) => {
    return {
      className: event.type === 'reserva' ? 'event-reserva' : 'event-bloqueo'
    };
  };

  const handlePrevMonth = () => {
    setCurrentDate(moment(currentDate).subtract(1, 'month').toDate());
  };

  const handleNextMonth = () => {
    setCurrentDate(moment(currentDate).add(1, 'month').toDate());
  };

  return (
    <>
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
          
          <label style={{ fontWeight: 'bold', color: '#43523A', display: 'flex', alignItems: 'center', gap: '10px' }}>
            Mes:
            <input 
              type="month" 
              value={moment(currentDate).format('YYYY-MM')} 
              onChange={(e) => {
                if(e.target.value) {
                  setCurrentDate(moment(e.target.value, 'YYYY-MM').toDate());
                }
              }}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', outline: 'none' }}
            />
          </label>

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

      <Container>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          culture="es"
          selectable
          popup
          max={2}
          date={currentDate}
          onNavigate={(newDate) => setCurrentDate(newDate)}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={eventPropGetter}
          messages={{
            next: "Sig",
            previous: "Ant",
            today: "Hoy",
            month: "Mes",
            week: "Semana",
            day: "Día",
            agenda: "Agenda",
            date: "Fecha",
            time: "Hora",
            event: "Evento",
            noEventsInRange: "No hay eventos en este rango.",
            showMore: (count) => `+${count} más`,
          }}
        />
      </Container>

      {modalAbierto && (
        <ModalBloqueo
          setModalAbierto={setModalAbierto}
          fetchData={loadEvents}
          cabanas={cabanas}
          initialDates={selectedDates}
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
    </>
  );
}

export default Disponibilidad;
