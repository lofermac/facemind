import React from 'react';
import { CheckCircleIcon, XCircleIcon, ClockIcon, CalendarDaysIcon, ArrowPathRoundedSquareIcon } from '@heroicons/react/24/solid';

type Status = 'ativo' | 'proximo_vencimento' | 'vencido' | 'sem_duracao' | 'renovado';

interface Props {
  status: Status;
  dias?: number | null;
  meta?: { agendado?: boolean; renovadoRecente?: boolean };
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, dias, meta, size = 'md' }: Props) {
  const base = {
    ativo:      { cls: 'bg-green-50 text-green-700', icon: <CheckCircleIcon className="h-4 w-4 mr-1 text-green-400"/> },
    proximo_vencimento: { cls: 'bg-yellow-300 text-yellow-900', icon: <ClockIcon className="h-4 w-4 mr-1 text-yellow-900"/> },
    vencido:    { cls: 'bg-red-50 text-red-600', icon: <XCircleIcon className="h-4 w-4 mr-1 text-red-300"/> },
    sem_duracao:{ cls: 'bg-slate-100 text-slate-500', icon: null },
    renovado:   { cls: 'bg-blue-50 text-blue-600', icon: null }
  }[status];

  let texto = '';
  if (status === 'ativo' && typeof dias === 'number') texto = `Ativo (+ ${dias} dias)`;
  else if (status === 'proximo_vencimento' && typeof dias === 'number') texto = `Vence em ${dias} dias`;
  else if (status === 'vencido' && typeof dias === 'number') texto = `Vencido há ${dias} dias`;
  else if (status === 'sem_duracao') texto = 'Sem duração definida';
  else if (status === 'renovado') texto = 'Renovado';

  const pad = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-4 py-1 text-sm';

  return (
    <div className={`inline-flex items-center rounded-full font-medium shadow-sm ${base.cls} ${pad}`}>
      {base.icon}
      <span>{texto}</span>
      {meta?.agendado && (
        <span className="ml-2 inline-flex items-center text-slate-500" title="Agendado">
          <CalendarDaysIcon className="h-4 w-4" />
        </span>
      )}
      {meta?.renovadoRecente && (
        <span className="ml-1 inline-flex items-center text-blue-500" title="Procedimento mais recente registrado">
          <ArrowPathRoundedSquareIcon className="h-4 w-4" />
        </span>
      )}
    </div>
  );
}


