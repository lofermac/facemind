import React from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';

interface DataPoint {
  metric: string;
  value: number;
}

interface RadarPatientsStatusProps {
  data: DataPoint[];
}

export default function RadarPatientsStatus({ data }: RadarPatientsStatusProps) {
  return (
    <div className="bg-white/60 backdrop-blur-xl shadow-lg rounded-2xl p-6 border border-white/30">
      <h3 className="text-lg font-bold text-slate-900 mb-4">Visão Geral de Pacientes</h3>
      <div className="w-full h-72">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart outerRadius="80%" data={data}>
            <PolarGrid strokeOpacity={0.2} />
            <PolarAngleAxis dataKey="metric" tick={{ fill: '#475569', fontSize: 12 }} />
            <PolarRadiusAxis angle={30} tickCount={5} tick={{ fill: '#64748b', fontSize: 10 }} />
            <Radar name="Pacientes" dataKey="value" stroke="#14b8a6" fill="#5eead4" fillOpacity={0.4} />
            <Tooltip formatter={(v:number)=>v.toLocaleString('pt-BR')} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
} 