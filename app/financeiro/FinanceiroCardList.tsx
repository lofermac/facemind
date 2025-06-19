'use client';

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';

interface Procedimento {
  id: string;
  data_procedimento: string | null;
  paciente_nome: string;
  categoria_nome: string | null;
  procedimento_nome: string | null;
  valor_cobrado: number | null;
}

const formatarValor = (valor: number | null) => {
  if (valor === null || valor === undefined) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
};

export default function FinanceiroCardList({ procedimentos }: { procedimentos: Procedimento[] }) {
  const formatarData = (data: string | null) => {
    if (!data) return '-';
    return format(new Date(data), "dd/MM/yyyy", { locale: ptBR });
  };

  return (
    <div className="space-y-4 md:hidden">
      {procedimentos.map((proc) => (
        <div key={proc.id} className="bg-white/60 backdrop-blur-xl p-4 rounded-2xl shadow border border-white/30">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-slate-800 text-sm">{proc.procedimento_nome}</h3>
            <span className="text-xs text-slate-500">{formatarData(proc.data_procedimento)}</span>
          </div>
          <p className="text-sm text-slate-600"><strong>Paciente:</strong> {proc.paciente_nome}</p>
          <p className="text-sm text-slate-500"><strong>Categoria:</strong> {proc.categoria_nome || '-'}</p>
          <p className="mt-2 inline-block bg-green-50 text-green-700 text-sm font-semibold px-3 py-1 rounded-xl shadow-sm">
            {formatarValor(proc.valor_cobrado)}
          </p>
        </div>
      ))}
      {procedimentos.length === 0 && (
        <p className="text-center text-slate-500 py-12">Nenhum procedimento encontrado.</p>
      )}
    </div>
  );
} 