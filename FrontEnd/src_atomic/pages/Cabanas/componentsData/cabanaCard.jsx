import styled from "styled-components";
import { useState, useEffect } from 'react';
import SquareCard from '../../../components/molecules/cards/squareCard';
import LinearGraph from '../../../components/organisms/graphs/linearGraph';
import { useFetch } from '../../../hooks/fetchConnect';

import { formatCurrency } from '../../../utils/formattersUtil';

const CardsCont = styled.div`
  margin: 30px 0;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;

  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const GraphContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

function CabanasCard({ refreshTrigger }) {
  const { data, fetchData } = useFetch();

  useEffect(() => {
    fetchData(`${import.meta.env.VITE_API_BASE_URL}/api/cabins/stats`);
  }, [fetchData, refreshTrigger]);

  const stats = [
    {
      bgColor: '',
      texto: 'Cabaña más reservada',
      titulo: data?.most_reserved?.['Cabaña'] || 'N/A',
    },
    {
      bgColor: '',
      texto: 'Veces reservada',
      titulo: data?.most_reserved ? data.most_reserved['Veces reservada'] : '0',
    },
    {
      bgColor: '',
      texto: 'Ganancias',
      titulo: data?.most_reserved ? formatCurrency(data.most_reserved['Ingresos generados']) : '$0',
    },
    {
      bgColor: 'verde',
      texto: 'Total de cabañas',
      titulo: data?.total_cabins?.['Total de cabañas'] || '0',
    },
  ];

  return (
    <CardsCont>
      <GraphContainer>
        <LinearGraph data={data?.revenue_graph} xKey="cabana" title="Ganancias generadas por cabaña" />
      </GraphContainer>
      <SquareCard squareData={stats} />
    </CardsCont>
  );
}

export default CabanasCard;
