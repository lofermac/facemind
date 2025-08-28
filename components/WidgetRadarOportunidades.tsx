'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { BellIcon } from '@heroicons/react/24/solid';

export interface ProcedimentoOportunidade {
  id: string;
  nome: string;
  paciente: string;
  diasParaVencer: number;
}

interface WidgetRadarOportunidadesProps {
  procedimentos: ProcedimentoOportunidade[];
}

export default function WidgetRadarOportunidades({ procedimentos }: WidgetRadarOportunidadesProps) {
  const router = useRouter();

  const handleProcedimentoClick = (procedimentoId: string) => {
    // O ID vem no formato "paciente_id-data-procedimento_id-nome"
    const parts = procedimentoId.split('-');
    if (parts.length >= 1) {
      const pacienteId = parts[0]; // ID do paciente
      router.push(`/pacientes/${pacienteId}`);
    }
  };

  return (
    <div className="bg-white/80 shadow-xl rounded-2xl p-6 flex flex-col gap-4 border border-slate-200 hover:shadow-2xl transition-all duration-200">
      <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-2">
        <BellIcon className="w-6 h-6 text-blue-500" />
        Contato Imediato
      </h3>
      {procedimentos.length === 0 ? (
        <div className="flex min-h-[220px] items-center justify-center text-center flex-col">
          <div className="text-4xl">📣</div>
          <div className="mt-2 text-sm text-slate-500 italic">Sem contatos imediatos.</div>
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {procedimentos.map((item) => (
            <li 
              key={item.id} 
              className="py-3 flex items-center justify-between group cursor-pointer hover:bg-slate-50 rounded-md px-2 transition-colors"
              onClick={() => handleProcedimentoClick(item.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') handleProcedimentoClick(item.id);
              }}
            >
              <div>
                <span className="font-semibold text-slate-900">{item.nome}</span>
                <span className="text-slate-500 ml-2">- {item.paciente}</span>
              </div>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 group-hover:bg-blue-200 transition">
                Vence em {item.diasParaVencer} dias
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
