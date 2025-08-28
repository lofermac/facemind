import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface DataPoint {
  label: string;
  value: number;
  isForecast?: boolean;
}

interface ForecastRevenueChartProps {
  data: DataPoint[];
}

export default function ForecastRevenueChart({ data }: ForecastRevenueChartProps) {
  const actual = data.filter(d => !d.isForecast);
  const forecast = data.filter(d => d.isForecast);

  return (
    <div className="bg-white/60 backdrop-blur-xl shadow-lg rounded-2xl p-6 border border-white/30">
      <h3 className="text-lg font-bold text-slate-900 mb-4">Previsão de Faturamento (próximos 3 meses)</h3>
      <div className="w-full h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
            <XAxis dataKey="label" tick={{ fill: '#475569', fontSize: 12 }} />
            <YAxis tickFormatter={(v:number)=>v.toLocaleString('pt-BR', {style:'currency', currency:'BRL', maximumFractionDigits:0})} tick={{ fill: '#475569', fontSize: 12 }} />
            <Tooltip formatter={(v:number)=>v.toLocaleString('pt-BR', {style:'currency', currency:'BRL'})} />
            <Legend />
            <Line dataKey="value" stroke="#4f46e5" strokeWidth={2} dot={false} name="Real" />
            <Line data={forecast} dataKey="value" stroke="#f43f5e" strokeDasharray="4 4" dot={{ r: 3 }} name="Previsto" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
} 