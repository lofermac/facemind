import React from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts';

interface RadialProgressRevenueProps {
  percent: number; // 0 - 1
}

export default function RadialProgressRevenue({ percent }: RadialProgressRevenueProps) {
  const data = [{ name: 'Progresso', value: percent * 100, fill: '#8b5cf6' }];
  return (
    <div className="bg-white/60 backdrop-blur-xl shadow-lg rounded-2xl p-6 border border-white/30 flex flex-col items-center justify-center">
      <h3 className="text-lg font-bold text-slate-900 mb-4 text-center">Meta de Faturamento</h3>
      <div className="w-full h-64 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="60%"
            outerRadius="100%"
            barSize={18}
            data={data}
            startAngle={90}
            endAngle={-270}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
            {/* @ts-ignore */}
            <RadialBar background clockWise dataKey="value" />
          </RadialBarChart>
        </ResponsiveContainer>
        <span className="absolute text-3xl font-bold text-violet-600 drop-shadow-lg">
          {(percent * 100).toFixed(0)}%
        </span>
      </div>
    </div>
  );
} 