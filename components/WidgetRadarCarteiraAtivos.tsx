'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ClipboardDocumentListIcon } from '@heroicons/react/24/solid';

export interface ProcedimentoAtivoResumo {
  nome: string; // Agora representa o nome da categoria
  quantidade: number;
}

interface WidgetRadarCarteiraAtivosProps {
  carteira: ProcedimentoAtivoResumo[];
}

export default function WidgetRadarCarteiraAtivos({ carteira }: WidgetRadarCarteiraAtivosProps) {
  const router = useRouter();

  const handleCategoriaClick = (nomeCategoria: string) => {
    // Navegar para procedimentos filtrados por categoria e apenas ativos
    router.push(`/procedimentos?categoria=${encodeURIComponent(nomeCategoria)}&filtroStatus=ativo`);
  };

  return (
    <div className="bg-white/80 shadow-xl rounded-2xl p-6 flex flex-col gap-4 border border-slate-200 hover:shadow-2xl transition-all duration-200">
      <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-2">
        <ClipboardDocumentListIcon className="w-6 h-6 text-green-500" />
        Carteira de Procedimentos
      </h3>
      {carteira.length === 0 ? (
        <div className="flex min-h-[220px] items-center justify-center text-center flex-col">
          <div className="text-4xl">🗂️</div>
          <div className="mt-2 text-sm text-slate-500 italic">Sem itens na carteira.</div>
        </div>
      ) : (
        <ul className="divide-y divide-slate-100 max-h-48 overflow-y-auto pr-1">
          {carteira.map((item) => (
            <li 
              key={item.nome} 
              className="py-3 flex items-center justify-between group cursor-pointer hover:bg-slate-50 rounded-md px-2 transition-colors"
              onClick={() => handleCategoriaClick(item.nome)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') handleCategoriaClick(item.nome);
              }}
            >
              <span className="font-semibold text-slate-900">{item.nome}</span>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 group-hover:bg-green-200 transition">
                {item.quantidade} ativos
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
