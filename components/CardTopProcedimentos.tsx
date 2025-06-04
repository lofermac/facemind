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
    <div className="bg-white rounded-md shadow-sm p-5 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-medium text-gray-500">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className={`${iconColor}`}>
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
        )}
      </div>
      <div className="mt-3 flow-root">
        <ul role="list" className="-my-1 divide-y divide-gray-100">
          {procedimentos.map((proc, index) => (
            <li key={index} className="flex items-center justify-between py-2">
              <p className="text-sm text-gray-800 truncate pr-2">
                {proc.nome}
              </p>
              <p className="text-sm font-medium text-gray-500">
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