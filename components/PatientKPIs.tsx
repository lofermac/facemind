import React from 'react';
import { BanknotesIcon, ChartBarIcon, ClipboardDocumentListIcon, CalendarIcon, SparklesIcon } from '@heroicons/react/24/outline';

interface PatientKPIsProps {
  faturamento: number;
  lucro: number;
  procedimentos: number;
  ultimoProcedimento: string | null;
  indiceFidelidade: number | null;
}

const kpiList = [
  {
    key: 'faturamento',
    label: 'Faturamento',
    icon: BanknotesIcon,
    color: 'text-blue-600',
    format: (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  },
  {
    key: 'lucro',
    label: 'Lucro',
    icon: ChartBarIcon,
    color: 'text-green-600',
    format: (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  },
  {
    key: 'procedimentos',
    label: 'Procedimentos',
    icon: ClipboardDocumentListIcon,
    color: 'text-slate-700',
    format: (v: number) => v.toString()
  },
  {
    key: 'ultimoProcedimento',
    label: 'Último Procedimento',
    icon: CalendarIcon,
    color: 'text-orange-600',
    format: (v: string | null) => v ? new Date(v).toLocaleDateString('pt-BR') : 'N/A'
  },
  {
    key: 'indiceFidelidade',
    label: 'Índice de Fidelidade',
    icon: SparklesIcon,
    color: 'text-purple-600',
    format: (v: number | null) => v === null ? 'N/A' : `${Math.round(v)}%`
  }
];

export default function PatientKPIs(props: PatientKPIsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {kpiList.map(kpi => {
        const Icon = kpi.icon;
        // @ts-ignore
        const value = props[kpi.key];
        return (
          <div key={kpi.key} className="bg-white/80 rounded-2xl shadow p-5 flex flex-col items-center border border-white/30">
            <Icon className={`h-7 w-7 mb-2 ${kpi.color}`} />
            <div className="text-xs font-medium text-slate-500 mb-1">{kpi.label}</div>
            <div className={`text-xl font-bold ${kpi.color}`}>{kpi.format(value)}</div>
          </div>
        );
      })}
    </div>
  );
}
