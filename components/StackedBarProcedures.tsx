import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DataItem {
  label: string;
  [categoria: string]: string | number; // extra keys for categories
}

interface StackedBarProceduresProps {
  data: DataItem[];
  categories: string[]; // ordem
}

export default function StackedBarProcedures({ data, categories }: StackedBarProceduresProps) {
  const colors = ['#3b82f6', '#ec4899', '#fbbf24', '#10b981', '#8b5cf6'];
  return (
    <div className="bg-white/60 backdrop-blur-xl shadow-lg rounded-2xl p-6 border border-white/30">
      <h3 className="text-lg font-bold text-slate-900 mb-4">Procedimentos por Categoria (6M)</h3>
      <div className="w-full h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 30 }}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
            <XAxis dataKey="label" tick={{ fill: '#475569', fontSize: 12 }} />
            <YAxis tick={{ fill: '#475569', fontSize: 12 }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {categories.map((cat, idx) => (
              <Bar key={cat} dataKey={cat} stackId="a" fill={colors[idx % colors.length]} radius={[4,4,0,0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
} 