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
    <div className="bg-white/60 backdrop-blur-xl shadow-lg rounded-2xl p-6 sm:p-8 h-full min-h-[340px] group hover:shadow-2xl transition-all duration-200 ease-in-out border border-white/30">
      <div className="mb-2">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          {Icon && <Icon className={`w-6 h-6 ${iconColor}`} aria-hidden="true" />}
          {title}
        </h3>
      </div>
      <div className="mt-3 flow-root">
        <ul role="list" className="-my-1 divide-y divide-gray-100 max-h-80 overflow-y-auto pr-1">
          {atendimentos.map((a, index) => (
            <li
              key={a.id + a.data + a.hora}
              className="flex flex-col sm:flex-row sm:items-center justify-between py-2 rounded-md cursor-pointer hover:bg-slate-50 px-2"
              onClick={() => router.push(`/agenda?date=${a.data}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') router.push(`/agenda?date=${a.data}`);
              }}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-900 truncate pr-2 font-medium">
                  {a.paciente}
                </p>
                <p className="text-xs text-slate-500 truncate pr-2">{a.rotulo}</p>
              </div>
              <div className="flex flex-row gap-2 items-center mt-1 sm:mt-0">
                <span className="text-sm font-semibold text-slate-600">
                  {(() => {
                    // Data: YYYY-MM-DD => DD/MM
                    const [ano, mes, dia] = a.data.split('-');
                    const dataObj = new Date(Number(ano), Number(mes) - 1, Number(dia));
                    const diasSemana = [
                      'Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'
                    ];
                    let diaSemana = diasSemana[dataObj.getDay()];
                    return (
                      <>
                        <span className="font-bold">{`${dia}/${mes}`}</span> - <span className="font-bold">{diaSemana}</span> às {a.hora.slice(0,5)}
                      </>
                    );
                  })()}
                </span>
              </div>
            </li>
          ))}
          {atendimentos.length === 0 && (
            <li className="text-sm text-gray-500 py-2">Nenhum atendimento agendado para este mês.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
