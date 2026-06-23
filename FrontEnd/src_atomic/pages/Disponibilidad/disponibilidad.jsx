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
  .rbc-event {
    border-radius: 4px;
    padding: 2px 6px;
    font-size: 0.8rem;
    font-weight: 500;
    box-shadow: 0 1px 3px rgba(0,0,0,0.15);
    transition: transform 0.2s, box-shadow 0.2s;
    margin-bottom: 2px;
    /* Fix para que no sobrepasen el cuadro */
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.2;
  }
  .rbc-event-content {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .rbc-event:hover {
    transform: translateY(-1px);
    box-shadow: 0 3px 6px rgba(0,0,0,0.25);
    z-index: 5;
  }
  .event-reserva {
    background: linear-gradient(135deg, #43523A, #556B48);
    border: 1px solid #2d3826;
    border-left: 4px solid #8BC34A; /* Un verde más brillante para resaltar */
  }
  .event-bloqueo {
    background: linear-gradient(135deg, #c92a2a, #e03131);
    border: 1px solid #8b1c1c;
    border-left: 4px solid #ff8a80; /* Un rojo claro para resaltar */
  }
  
  .rbc-today {
    background-color: #e8f5e9; /* Fondo verde muy claro */
    border: 2px solid #43523A !important; /* Borde verde oscuro */
  }
  
  .rbc-today .rbc-button-link {
    font-weight: bold;
    color: #43523A;
    font-size: 1.1em;
    background-color: #c8e6c9;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-top: 5px;
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
