// components/DashboardCard.tsx
'use client';

import React from 'react';

interface DashboardCardProps {
  titulo: string;
  valor: number | string; // Pode ser número ou um texto como 'N/A'
  descricao?: string;
  cor?: string; // Ex: 'bg-blue-500', 'bg-green-500'
  icone?: React.ReactNode; // Para um ícone SVG, por exemplo
}

export default function DashboardCard({ 
  titulo, 
  valor, 
  descricao, 
  cor = 'bg-sky-600', // Cor padrão
  icone 
}: DashboardCardProps) {
  return (
    <div className={`p-6 rounded-xl shadow-lg text-white transform transition-all duration-300 hover:scale-105 ${cor}`}>
      {icone && <div className="mb-3 text-3xl opacity-80">{icone}</div>}
      <h3 className="text-xl font-semibold mb-1 truncate" title={titulo}>{titulo}</h3>
      <p className="text-4xl font-bold mb-2">{valor}</p>
      {descricao && <p className="text-sm opacity-90">{descricao}</p>}
    </div>
  );
}