import React, { useState } from 'react';
import { BanknotesIcon, ChartBarIcon, ClipboardDocumentListIcon, CalendarIcon, SparklesIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

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
  const [showTooltip, setShowTooltip] = useState(false);

  const FidelidadeTooltip = () => (
    <div className="absolute z-50 w-80 p-4 bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-xl shadow-2xl transform -translate-x-1/2 -translate-y-full mt-[-8px] left-1/2">
      {/* Seta do tooltip */}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-purple-200"></div>
      
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <SparklesIcon className="h-5 w-5 text-purple-600" />
          <h3 className="font-bold text-purple-800">Índice de Fidelidade</h3>
        </div>
        
        <p className="text-sm text-slate-700 mb-3 leading-relaxed">
          Este índice mostra o quão fiel e engajado é este paciente com a clínica, baseado em 4 critérios importantes:
        </p>
        
        <div className="space-y-2 text-xs text-left">
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-400 mt-1.5 flex-shrink-0"></div>
            <div>
              <span className="font-semibold text-purple-700">Pontualidade nas renovações</span>
              <span className="text-slate-600"> - faz procedimentos no tempo certo</span>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 flex-shrink-0"></div>
            <div>
              <span className="font-semibold text-blue-700">Tempo como cliente</span>
              <span className="text-slate-600"> - há quanto tempo é paciente</span>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 mt-1.5 flex-shrink-0"></div>
            <div>
              <span className="font-semibold text-green-700">Variedade de tratamentos</span>
              <span className="text-slate-600"> - confia em diferentes procedimentos</span>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-orange-400 mt-1.5 flex-shrink-0"></div>
            <div>
              <span className="font-semibold text-orange-700">Investimento financeiro</span>
              <span className="text-slate-600"> - valor médio dos procedimentos</span>
            </div>
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-purple-200">
          <div className="text-xs text-slate-600">
            <span className="font-medium">Interpretação:</span> Quanto maior o índice, mais fiel e valioso é o paciente! 💜
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {kpiList.map(kpi => {
        const Icon = kpi.icon;
        // @ts-ignore
        const value = props[kpi.key];
        const isIndiceFidelidade = kpi.key === 'indiceFidelidade';
        
        return (
          <div 
            key={kpi.key} 
            className={`bg-white/80 rounded-2xl shadow p-5 flex flex-col items-center border border-white/30 relative ${isIndiceFidelidade ? 'cursor-help' : ''}`}
            onMouseEnter={() => isIndiceFidelidade && setShowTooltip(true)}
            onMouseLeave={() => isIndiceFidelidade && setShowTooltip(false)}
          >
            <div className="flex items-center gap-1 mb-2">
              <Icon className={`h-7 w-7 ${kpi.color}`} />
              {isIndiceFidelidade && (
                <QuestionMarkCircleIcon className="h-4 w-4 text-purple-400 opacity-60" />
              )}
            </div>
            <div className="text-xs font-medium text-slate-500 mb-1">{kpi.label}</div>
            <div className={`text-xl font-bold ${kpi.color}`}>{kpi.format(value)}</div>
            
            {isIndiceFidelidade && showTooltip && <FidelidadeTooltip />}
          </div>
        );
      })}
    </div>
  );
}
