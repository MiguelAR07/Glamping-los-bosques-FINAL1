import styled from "styled-components";
import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { formatCurrency } from "../../../utils/formattersUtil";

const ContGraph = styled.div`
  width: 100%;
  height: 400px;
  border-radius: 5px;

  background-color: #ffffff;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);

  padding: 20px;
  box-sizing: border-box;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  h3 {
    margin: 0 0 15px 0;
    color: #333;
    align-self: flex-start;
  }

  @media (max-width: 500px) {
    height: 300px;
  }
`;

const COLORS = ['#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0'];

function PieGraph({ data, nameKey = 'metodo', dataKey = 'total', title = "Ingresos por Método de Pago" }) {
  
  if (!data || data.length === 0) {
    return (
      <ContGraph>
        <h3>{title}</h3>
        <p style={{ color: '#888' }}>No hay suficientes datos para mostrar</p>
      </ContGraph>
    );
  }

  return (
    <ContGraph>
      <h3>{title}</h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={5}
            dataKey={dataKey}
            nameKey={nameKey}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value) => [`${formatCurrency(value)}`, 'Ingresos']}
            labelStyle={{ color: '#333', fontWeight: 'bold' }}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          />
          <Legend verticalAlign="bottom" height={36}/>
        </PieChart>
      </ResponsiveContainer>
    </ContGraph>
  );
}

export default PieGraph;