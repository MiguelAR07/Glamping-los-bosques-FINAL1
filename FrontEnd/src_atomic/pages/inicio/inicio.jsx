import styled from "styled-components";
import { downloadPDF } from "../../utils/downloadUtils";

import BotonDescargar from "../../components/atoms/buttons/botonDescargar";
import InicioCard from "./componentsData/inicioCard";
import BarGraph from "../../components/organisms/graphs/barGraph";
import PieGraph from "../../components/organisms/graphs/PieGraph";
import NotificacionInicio from "./componentsData/inicioNotificacion";
import { useFetch } from "../../hooks/fetchConnect";
import { useEffect, useState } from "react";

const FechaInforme = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 20px 0;
`;

const GraphsContainer = styled.div`
  margin: 30px 0 0 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;

  @media (max-width: 1000px) {
    grid-template-columns: 1fr;
  }
`;

const NovedadesContainer = styled.div`
  margin: 30px 0 0 0;
  display: grid;
  grid-template-columns: 1fr;
`;

const Novedades = styled.div`
  h3{
    margin-bottom: 12px;
  }
`;

function Inicio() {
  const { data, fetchData } = useFetch();
  const [refreshStatsTrigger, setRefreshStatsTrigger] = useState(0);

  const handleDownloadPDF = () => {
    downloadPDF("dashboard-report", "Informe-mensual.pdf");
  }

  const handleFetchData = () => {
    fetchData(`${import.meta.env.VITE_API_BASE_URL}/api/payments/stats`);
    setRefreshStatsTrigger((prev) => prev + 1);
  };

  useEffect(() => {
    handleFetchData();
  }, [fetchData]);

  return (
    <div id="dashboard-report" style={{ padding: '10px' }}>
      <FechaInforme>
        <h3>Estadísticas Generales</h3>
        <BotonDescargar onClick={handleDownloadPDF} />
      </FechaInforme>
      <InicioCard refreshTrigger={refreshStatsTrigger} />
      
      <GraphsContainer>
        <BarGraph data={data?.revenue_by_cabin} title="Ingresos de cada cabaña" />
        <PieGraph data={data?.payments_by_method} title="Ingresos por Método de Pago" />
      </GraphsContainer>

      <NovedadesContainer>
        <Novedades>
          <h3>Novedades</h3>
          <NotificacionInicio />
        </Novedades>
      </NovedadesContainer>
    </div >
  );
}

export default Inicio;