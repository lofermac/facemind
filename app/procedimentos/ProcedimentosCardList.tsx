'use client';

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import Link from 'next/link';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

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
  renovado: 'bg-blue-100 text-blue-700',
};

interface Props {
  procedimentos: Procedimento[];
  onDelete?: (proc: any) => void;
}

export default function ProcedimentosCardList({ procedimentos, onDelete }: Props) {
  const router = useRouter();

  const formatarData = (data: string | null) => {
    if (!data) return '-';
    return format(new Date(data), "dd/MM/yyyy", { locale: ptBR });
  };

  return (
    <div className="space-y-4 md:hidden">
      {procedimentos.map((proc) => (
        <div
          key={proc.id}
          className="relative bg-white/60 backdrop-blur-xl p-5 rounded-2xl shadow border border-white/30 hover:shadow-xl transition cursor-pointer"
          onClick={() => router.push(`/procedimentos/editar/${proc.id}`)}
        >
          {proc.status_calculado && (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold shadow-sm border border-white/30 ${statusColors[proc.status_calculado] || 'bg-gray-100 text-gray-700'} absolute -top-3 left-3`}>{proc.status_calculado.charAt(0).toUpperCase() + proc.status_calculado.slice(1).replace('_', ' ')}</span>
          )}
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-semibold text-slate-800 text-base leading-tight pr-8">{proc.procedimento_nome}</h3>
          </div>
          <p className="text-sm text-slate-600 mb-0.5"><span className="font-medium">Paciente:</span> {proc.paciente_nome}</p>
          <div className="flex justify-between items-center mt-1">
            <p className="text-sm text-slate-500"><span className="font-medium">Categoria:</span> {proc.categoria_nome || '-'}</p>
            <span className="text-xs text-slate-500 whitespace-nowrap">{formatarData(proc.data_procedimento)}</span>
          </div>
          {/* Ações */}
          <div className="absolute top-3 right-3 flex space-x-2 z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/procedimentos/editar/${proc.id}`);
              }}
              className="bg-white/70 backdrop-blur-md rounded-full p-1.5 shadow text-blue-600 hover:text-blue-800 hover:shadow-lg transition"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(proc);
                }}
                className="bg-white/70 backdrop-blur-md rounded-full p-1.5 shadow text-red-600 hover:text-red-800 hover:shadow-lg transition"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      ))}
      {procedimentos.length === 0 && (
        <p className="text-center text-slate-500 py-12">Nenhum procedimento encontrado.</p>
      )}
    </div>
  );
} 