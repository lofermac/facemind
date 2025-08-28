import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface DataPoint {
  label: string;
  value: number;
}

interface ChartRevenueAreaProps {
  data: DataPoint[];
}

export default function ChartRevenueArea({ data }: ChartRevenueAreaProps) {
  return (
    <div className="bg-white/60 backdrop-blur-xl shadow-lg rounded-2xl p-6 border border-white/30">
      <h3 className="text-lg font-bold text-slate-900 mb-4">Evolução do Faturamento (últimos 7 meses)</h3>
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#a5b4fc" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
            <XAxis dataKey="label" tick={{ fill: '#475569', fontSize: 12 }} />
            <YAxis tickFormatter={(v:number)=>v.toLocaleString('pt-BR', {style:'currency', currency:'BRL', maximumFractionDigits:0})} tick={{ fill: '#475569', fontSize: 12 }} />
            <Tooltip formatter={(v:number)=>v.toLocaleString('pt-BR', {style:'currency', currency:'BRL'})} />
            <Area type="monotone" dataKey="value" stroke="#6366f1" fillOpacity={1} fill="url(#colorRev)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
} 