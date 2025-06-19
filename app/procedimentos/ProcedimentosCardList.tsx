'use client';

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';

interface Procedimento {
  id: string;
  data_procedimento: string | null;
  paciente_nome: string;
  categoria_nome: string | null;
  procedimento_nome: string | null;
  status_calculado?: string;
}

const statusColors: Record<string, string> = {
  ativo: 'bg-green-100 text-green-700',
  vencido: 'bg-red-100 text-red-700',
  proximo_vencimento: 'bg-yellow-100 text-yellow-700',
  sem_duracao: 'bg-gray-100 text-gray-700',
};

export default function ProcedimentosCardList({ procedimentos }: { procedimentos: Procedimento[] }) {
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
          {proc.status_calculado && (
            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${statusColors[proc.status_calculado] || 'bg-gray-100 text-gray-700'}`}>
              {proc.status_calculado.charAt(0).toUpperCase() + proc.status_calculado.slice(1).replace('_', ' ')}
            </span>
          )}
        </div>
      ))}
      {procedimentos.length === 0 && (
        <p className="text-center text-slate-500 py-12">Nenhum procedimento encontrado.</p>
      )}
    </div>
  );
} 