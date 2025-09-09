"use client";
import React from 'react';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

export interface ProximoAtendimento {
  id: string;
  paciente: string;
  data: string; // YYYY-MM-DD
  hora: string; // HH:mm
  rotulo?: string;
}

interface CardProximosAtendimentosProps {
  title?: string;
  atendimentos: ProximoAtendimento[];
  Icon?: React.ElementType;
  iconColor?: string;
}

export default function CardProximosAtendimentos({
  title = 'Próximos Atendimentos',
  atendimentos,
  Icon = CalendarDaysIcon,
  iconColor = 'text-blue-500',
}: CardProximosAtendimentosProps) {
  const router = useRouter();
  return (
    <div className="bg-white/60 backdrop-blur-xl shadow-lg rounded-2xl p-6 sm:p-8 h-full min-h-[540px] group hover:shadow-2xl transition-all duration-200 ease-in-out border border-white/30">
      <div className="mb-2">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          {Icon && <Icon className={`w-6 h-6 ${iconColor}`} aria-hidden="true" />}
          {title}
        </h3>
      </div>
      <div className="mt-3 flow-root">
        <ul role="list" className="-my-1 divide-y divide-gray-100 max-h-[350px] overflow-y-auto pr-1">
          {atendimentos
            .filter(a => a.paciente && a.data && a.hora) // Filtrar apenas atendimentos com dados válidos
            .map((a, index) => (
            <li
              key={`${a.id}-${a.data}-${a.hora}`}
              className="flex flex-row items-center justify-between py-2 rounded-md cursor-pointer hover:bg-slate-50 px-2 gap-2"
              onClick={() => router.push(`/agenda?date=${a.data}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') router.push(`/agenda?date=${a.data}`);
              }}
            >
              {/* Bloco 1: Nome + tipo */}
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-sm text-slate-900 font-medium truncate pr-2">{a.paciente}</span>
                <span
                  className={`text-xs truncate pr-2 font-medium
                    ${a.rotulo === 'Procedimento' ? 'text-blue-600' : ''}
                    ${a.rotulo === 'Retorno' ? 'text-green-600' : ''}
                    ${a.rotulo === 'Pessoal' ? 'text-orange-500' : ''}
                    ${!['Procedimento','Retorno','Pessoal'].includes(a.rotulo || '') ? 'text-slate-500' : ''}
                  `}
                >
                  {a.rotulo || 'Sem categoria'}
                </span>
              </div>
              {/* Bloco 2: Data DD/MM */}
              <div className="flex flex-col items-center w-14">
                <span className="text-sm font-bold text-slate-700">
                  {(() => {
                    try {
                      const [ano, mes, dia] = a.data.split('-');
                      return `${dia}/${mes}`;
                    } catch {
                      return 'N/A';
                    }
                  })()}
                </span>
              </div>
              {/* Bloco 3: Dia da semana */}
              <div className="flex flex-col items-center w-16">
                <span className="text-xs font-semibold text-slate-500">
                  {(() => {
                    try {
                      const [ano, mes, dia] = a.data.split('-');
                      const dataObj = new Date(Number(ano), Number(mes) - 1, Number(dia));
                      const diasSemana = [
                        'Dom', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'
                      ];
                      return diasSemana[dataObj.getDay()];
                    } catch {
                      return 'N/A';
                    }
                  })()}
                </span>
              </div>
              {/* Bloco 4: Horário */}
              <div className="flex flex-col items-center w-14">
                <span className="text-sm font-semibold text-slate-700">
                  {a.hora ? a.hora.slice(0,5) : 'N/A'}
                </span>
              </div>
            </li>
          ))}}
          {atendimentos.length === 0 && (
            <li className="text-sm text-gray-500 py-2">Nenhum atendimento agendado para este mês.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
