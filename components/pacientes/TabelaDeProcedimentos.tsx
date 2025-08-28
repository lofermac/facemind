import React from 'react';
import { EyeIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/navigation';
import StatusBadge from '@/components/StatusBadge';
import { calcProcedureStatus } from '@/utils/statusRules';





interface ProcedimentoRealizado {
  id: string;
  data_procedimento: string | null;
  valor_cobrado: number | null;
  procedimento_tabela_valores_id?: {
    nome_procedimento: string | null;
    duracao_efeito_meses?: number | null;
  } | null;
}

interface TabelaDeProcedimentosProps {
  procedimentos: ProcedimentoRealizado[];
}

function formatDate(date: string | null) {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('pt-BR');
}

function formatCurrency(value: number | null) {
  if (value === null || value === undefined) return 'R$ 0,00';
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function TabelaDeProcedimentos({ procedimentos }: TabelaDeProcedimentosProps) {
  const router = useRouter();

  const handleViewProcedimento = (procedimentoId: string) => {
    router.push(`/procedimentos/${procedimentoId}`);
  };

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white/90 backdrop-blur-xl shadow-2xl">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-[#eaf2fb] shadow-sm">
          <tr>
            <th className="px-6 py-4 text-center text-xs font-extrabold text-slate-700 uppercase tracking-wider rounded-tl-2xl">Data</th>
            <th className="px-6 py-4 text-center text-xs font-extrabold text-slate-700 uppercase tracking-wider">Procedimento</th>
            <th className="px-6 py-4 text-center text-xs font-extrabold text-slate-700 uppercase tracking-wider">Valor Cobrado</th>
            <th className="px-6 py-4 text-center text-xs font-extrabold text-slate-700 uppercase tracking-wider">Duração</th>
            <th className="px-6 py-4 text-center text-xs font-extrabold text-slate-700 uppercase tracking-wider">Status</th>
            <th className="px-6 py-4 text-center text-xs font-extrabold text-slate-700 uppercase tracking-wider rounded-tr-2xl">Ações</th>
          </tr>
        </thead>
        <tbody>
          {procedimentos.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center py-12 text-slate-400 text-lg">Nenhum procedimento encontrado.</td>
            </tr>
          ) : (
            procedimentos.map((proc, idx) => {
              const nome = proc.procedimento_tabela_valores_id?.nome_procedimento || 'N/A';
              const duracao = proc.procedimento_tabela_valores_id?.duracao_efeito_meses;
              
              // Usar a mesma lógica de status da página /procedimentos
              const statusInfo = calcProcedureStatus(
                proc.data_procedimento, 
                duracao ?? null
              );

              return (
                <tr key={proc.id} className={`transition-all ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-blue-50 group`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-700 text-center">{formatDate(proc.data_procedimento)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800 font-medium text-center">{nome}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-base font-bold text-green-600 text-center">{formatCurrency(proc.valor_cobrado)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 text-center">{duracao ? `${duracao} meses` : 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <StatusBadge 
                      status={statusInfo.status} 
                      dias={statusInfo.dias}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button 
                      onClick={() => handleViewProcedimento(proc.id)}
                      className="inline-flex items-center justify-center p-2 rounded-full hover:bg-blue-100 transition group-hover:scale-110 cursor-pointer" 
                      title="Ver detalhes do procedimento"
                    >
                      <EyeIcon className="h-5 w-5 text-blue-500 hover:text-blue-600" />
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
