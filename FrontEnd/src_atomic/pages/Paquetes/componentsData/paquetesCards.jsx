import RectangleCard from "../../../components/molecules/cards/rectangleCard";
import PieGraph from "../../../components/organisms/graphs/PieGraph";
import { useEffect } from "react";
import { useFetch } from "../../../hooks/fetchConnect";

function PaquetesCards({ refreshTrigger }) {
  const { data, loading, error, fetchData } = useFetch();

  useEffect(() => {
    fetchData(`${import.meta.env.VITE_API_BASE_URL}/api/packages/stats`);
  }, [refreshTrigger]);

  const mostFrecuent = data?.most_frecuent_package?.[0];
  const leastFrecuent = data?.least_frecuent_package?.[0];

  const paquetesCardData = [
    {
      bgColor: 'verde',
      icono: 'bi bi-box-fill',
      titulo: 'Paquete mas vendido',
      info: mostFrecuent ? mostFrecuent.tipo : 'N/A',
      texto: mostFrecuent ? `El paquete ha sido reservado ${mostFrecuent.veces_reservado} veces` : 'Sin datos',
    },
    {
      bgColor: '',
      icono: 'bi bi-box-fill',
      titulo: 'Paquete menos vendido',
      info: leastFrecuent ? leastFrecuent.tipo : 'N/A',
      texto: leastFrecuent ? `El paquete ha sido reservado solo ${leastFrecuent.veces_reservado} veces` : 'Sin datos',
    }
  ];

  const pieGraphData = [
    {
      titulo: 'Top 3 paquetes',
      data: data?.top_packages?.map(item => ({
        name: item.tipo,
        value: parseInt(item.veces_reservado, 10),
      })) || []
    }
  ];

  return (
    <>
    {loading && <p>Cargando estadísticas...</p>}
    {error && <p>Error al cargar datos</p>}
    {data && (
      <>
        <RectangleCard rectangleData={paquetesCardData} />
        <PieGraph pieGraphData={pieGraphData} />
      </>
    )}
    </>
  );
}

export default PaquetesCards;