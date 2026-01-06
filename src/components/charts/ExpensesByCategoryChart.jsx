import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-3">
        <p className="font-medium text-gray-900">{data.name}</p>
        <p className="text-sm text-gray-600">
          {new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          }).format(data.value)}
        </p>
        <p className="text-xs text-gray-400">{data.percentage?.toFixed(1)}%</p>
      </div>
    );
  }
  return null;
};

const CustomLegend = ({ payload }) => {
  return (
    <div className="flex flex-wrap justify-center gap-3 mt-4">
      {payload?.map((entry, index) => (
        <div key={index} className="flex items-center gap-1.5">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs text-gray-600">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function ExpensesByCategoryChart({ data = [], type = 'donut' }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  const chartData = data.map(item => ({
    ...item,
    percentage: total > 0 ? (item.value / total) * 100 : 0
  }));

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <div className="w-16 h-16 rounded-full border-4 border-gray-200 border-dashed flex items-center justify-center mb-3">
          <span className="text-2xl">📊</span>
        </div>
        <p className="text-sm">Nenhum dado disponível</p>
      </div>
    );
  }

  return (
    <div className="w-full relative">
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={type === 'donut' ? 60 : 0}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color}
                stroke="white"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Total in center for donut */}
      {type === 'donut' && (
        <div className="absolute top-[90px] left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-lg font-bold text-gray-900">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
                notation: 'compact'
              }).format(total)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}