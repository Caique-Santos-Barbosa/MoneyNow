import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-3">
        <p className="font-medium text-gray-900 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-600">{entry.name}</span>
            </div>
            <span className="font-medium" style={{ color: entry.color }}>
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(entry.value)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function MonthlyBalanceChart({ data = [] }) {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <div className="w-16 h-16 rounded-full border-4 border-gray-200 border-dashed flex items-center justify-center mb-3">
          <span className="text-2xl">📈</span>
        </div>
        <p className="text-sm">Nenhum dado disponível</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart
        data={data}
        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#00D68F" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#00D68F" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#FF5252" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#FF5252" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid 
          strokeDasharray="3 3" 
          stroke="#E5E7EB" 
          vertical={false}
        />
        <XAxis 
          dataKey="month" 
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#9CA3AF', fontSize: 12 }}
        />
        <YAxis 
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#9CA3AF', fontSize: 12 }}
          tickFormatter={(value) => 
            new Intl.NumberFormat('pt-BR', {
              notation: 'compact',
              compactDisplay: 'short'
            }).format(value)
          }
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          wrapperStyle={{ paddingTop: '20px' }}
          iconType="circle"
          iconSize={8}
        />
        <Area
          type="monotone"
          dataKey="income"
          name="Receitas"
          stroke="#00D68F"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorIncome)"
        />
        <Area
          type="monotone"
          dataKey="expense"
          name="Despesas"
          stroke="#FF5252"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorExpense)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}