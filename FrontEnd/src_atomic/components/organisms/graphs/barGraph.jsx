import styled from "styled-components";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
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

function BarGraph({ data, xKey = 'cabana', yKey = 'total', title = "Ingresos por Cabaña", color = "#059669" }) {
  
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
        <BarChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
          <XAxis 
            dataKey={xKey} 
            tick={{ fontSize: 12, fill: '#666' }} 
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: '#666' }} 
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip 
            formatter={(value) => [`${formatCurrency(value)}`, 'Ingresos']}
            labelStyle={{ color: '#333', fontWeight: 'bold' }}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            cursor={{ fill: 'rgba(5, 150, 105, 0.1)' }}
          />
          <Bar dataKey={yKey} fill={color} radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ContGraph>
  );
}

export default BarGraph;
