'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { UserMinusIcon } from '@heroicons/react/24/solid';

export interface PacienteChurn {
  id: string;
  nome: string;
  mesesSemVisita: number;
}

interface WidgetRadarChurnProps {
  pacientes: PacienteChurn[];
}

export default function WidgetRadarChurn({ pacientes }: WidgetRadarChurnProps) {
  const router = useRouter();

  const handlePacienteClick = (pacienteId: string) => {
    // Navegar para o perfil do paciente
    router.push(`/pacientes/${pacienteId}`);
  };

  return (
    <div className="bg-white/80 shadow-xl rounded-2xl p-6 flex flex-col gap-4 border border-slate-200 hover:shadow-2xl transition-all duration-200">
      <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-2">
        <UserMinusIcon className="w-6 h-6 text-purple-500" />
        Alerta de Perda
      </h3>
      {pacientes.length === 0 ? (
        <div className="flex min-h-[220px] items-center justify-center text-center flex-col">
          <div className="text-4xl">🎉</div>
          <div className="mt-2 text-sm text-slate-500 italic">Sem risco de perda.</div>
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {pacientes.map((item) => (
            <li 
              key={item.id} 
              className="py-3 flex items-center justify-between group cursor-pointer hover:bg-slate-50 rounded-md px-2 transition-colors"
              onClick={() => handlePacienteClick(item.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') handlePacienteClick(item.id);
              }}
            >
              <span className="font-semibold text-slate-900">{item.nome}</span>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 group-hover:bg-purple-200 transition">
                {item.mesesSemVisita} meses sem visita
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
