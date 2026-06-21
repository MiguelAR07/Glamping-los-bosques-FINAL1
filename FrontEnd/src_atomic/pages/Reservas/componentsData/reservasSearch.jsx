import SearchTemplate from "../../../components/templates/searchTemplate";

export const reservationFilterConfig = {
  endpoint: "/api/reservations/filters",
  filters: {
    "Reservas recientes": {
      cacheKey: "incomingReservations",
      localFilter: (arr) => arr.filter(r => r.llegada === CURRENT_DATE && (!r.estado || !r.estado.toLowerCase().includes('cancelad')))
    },
    "Reservas pagadas": {
      cacheKey: "paidReservations",
      localFilter: (arr) => arr.filter(r => r.estado === 'Pagado')
    },
    "Reservas confirmadas": {
      cacheKey: "confirmedReservations",
      localFilter: (arr) => arr.filter(r => r.estado === 'Confirmado')
    },
    "Reservas canceladas": {
      cacheKey: "canceledReservations",
      localFilter: (arr) => arr.filter(r => r.estado && r.estado.toLowerCase().includes('cancelad'))
    }
  }
};

const options = [
  { nombre: "Todos", selected: "selected" },
  { nombre: "Sueldo DESC", selected: "" },
  { nombre: "Sueldo ASC", selected: "" },
  { nombre: "Inactivos", selected: "" },
  { nombre: "Administradores", selected: "" },
];

function ReservasSearch({ onResult, onFilterChange }) {
  return (
    <SearchTemplate
      modulo={"users"}
      placeholder={"Buscar usuario"}
      onResult={onResult}
      onFilterChange={onFilterChange}
      options={options}
    />
  );
}

export default ReservasSearch;
