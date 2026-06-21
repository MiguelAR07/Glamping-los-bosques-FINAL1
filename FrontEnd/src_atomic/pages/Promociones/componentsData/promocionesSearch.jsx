import SearchTemplate from "../../../components/templates/searchTemplate";

export const promocionesFilterConfig = {
    endpoint: "/api/promociones/filters",
    filters: {
        Inactivos: {
            cacheKey: "idle_promociones",
            localFilter: (arr) => arr.filter((p) => p.estado === "Inactivo"),
        },
        Activos: {
            cacheKey: "active_promociones",
            localFilter: (arr) => arr.filter((p) => p.estado === "Activo"),
        }
    }
}

const options = [
    { nombre: "Todos", selected: "selected" },
    { nombre: "Inactivos", selected: "" },
    { nombre: "Activos", selected: "" }
];

function PromocionesSearch({ onResult, onFilterChange }) {
    return (
        <SearchTemplate
            modulo={"promociones"}
            placeholder={"Buscar promoción"}
            onResult={onResult}
            onFilterChange={onFilterChange}
            options={options}
        />
    );
}

export default PromocionesSearch;
