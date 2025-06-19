// components/CardTopProcedimentos.tsx
import React from 'react';

interface Procedimento {
  nome: string;
  quantidade: number;
}

interface CardTopProcedimentosProps {
  title: string;
  subtitle?: string;
  procedimentos: Procedimento[];
  Icon?: React.ElementType; // ✨ ÍCONE OPCIONAL ADICIONADO ✨
  iconColor?: string;
}

export default function CardTopProcedimentos({ title, subtitle, procedimentos, Icon, iconColor = "text-gray-400" }: CardTopProcedimentosProps) {
  return (
    <div className="bg-white/60 backdrop-blur-xl shadow-lg rounded-2xl p-4 sm:p-6 h-full group hover:shadow-2xl transition-all duration-200 ease-in-out border border-white/30">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-semibold text-slate-600">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className={`w-10 h-10 flex items-center justify-center rounded-full bg-white/40 backdrop-blur-md shadow-sm ${iconColor}`}>
            <Icon className="h-6 w-6" aria-hidden="true" />
          </div>
        )}
      </div>
      <div className="mt-3 flow-root">
        <ul role="list" className="-my-1 divide-y divide-gray-100">
          {procedimentos.map((proc, index) => (
            <li key={index} className="flex items-center justify-between py-2">
              <p className="text-sm text-slate-900 truncate pr-2 font-medium">
                {proc.nome}
              </p>
              <p className="text-sm font-semibold text-slate-600">
                {proc.quantidade}
              </p>
            </li>
          ))}
          {procedimentos.length === 0 && (
            <li className="text-sm text-gray-500 py-2">Nenhum procedimento encontrado.</li>
          )}
        </ul>
      </div>
    </div>
  );
}