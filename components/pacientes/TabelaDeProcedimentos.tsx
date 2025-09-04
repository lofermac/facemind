import React, { useState, useEffect } from 'react';
import { EyeIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/navigation';
import StatusBadge from '@/components/StatusBadge';
import { calcProcedureStatus } from '@/utils/statusRules';
import { supabase } from '@/utils/supabaseClient';





interface ProcedimentoRealizado {
  id: string;
  data_procedimento: string | null;
  valor_cobrado: number | null;
  procedimento_tabela_valores_id?: {
    nome_procedimento: string | null;
    duracao_efeito_meses?: number | null;
  } | null;
  status_calculado?: string; // Campo para controlar status de renovado
}

interface ProcedimentoComStatus extends ProcedimentoRealizado {
  status_calculado: string;
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
  const [procedimentosComStatus, setProcedimentosComStatus] = useState<ProcedimentoComStatus[]>([]);
  const [mapaDuracaoProcedimentos, setMapaDuracaoProcedimentos] = useState<Map<string, number>>(new Map());

  const handleViewProcedimento = (procedimentoId: string) => {
    router.push(`/procedimentos/${procedimentoId}`);
  };

  // Função para calcular status com lógica de renovado (igual à página /procedimentos)
  const calcularStatusComRenovado = (proc: ProcedimentoRealizado, duracao: number | null) => {
    if (proc.status_calculado === 'renovado') {
      return { status: 'renovado', dias: null };
    }
    return calcProcedureStatus(proc.data_procedimento, duracao);
  };

  // useEffect para aplicar a mesma lógica da página /procedimentos
  useEffect(() => {
    const processarProcedimentos = async () => {
      // Buscar todas as durações da tabela de valores (igual à página /procedimentos)
      const { data: duracoesProcedimentos } = await supabase
        .from('procedimentos_tabela_valores')
        .select('nome_procedimento, duracao_efeito_meses');

      const mapaDuracao = new Map<string, number>();
      (duracoesProcedimentos || []).forEach(p => {
        if (p.nome_procedimento && p.duracao_efeito_meses) {
          // Usar normalização consistente (trim + toLowerCase)
          const nomeNormalizado = p.nome_procedimento.toLowerCase().trim();
          mapaDuracao.set(nomeNormalizado, p.duracao_efeito_meses);
        }
      });
      setMapaDuracaoProcedimentos(mapaDuracao);

      // Aplicar lógica de renovado: agrupar por nome do procedimento
      const mapaPorProcedimento: Record<string, ProcedimentoRealizado[]> = {};
      procedimentos.forEach(proc => {
        const nomeProc = proc.procedimento_tabela_valores_id?.nome_procedimento || '';
        if (nomeProc) {
          if (!mapaPorProcedimento[nomeProc]) {
            mapaPorProcedimento[nomeProc] = [];
          }
          mapaPorProcedimento[nomeProc].push(proc);
        }
      });

      // Para cada grupo, ordenar por data ASC e marcar todos exceto o mais recente como renovado
      const procedimentosProcessados: ProcedimentoComStatus[] = [];
      Object.values(mapaPorProcedimento).forEach(lista => {
        lista.sort((a, b) => {
          if (!a.data_procedimento || !b.data_procedimento) return 0;
          return new Date(a.data_procedimento).getTime() - new Date(b.data_procedimento).getTime();
        });
        
        if (lista.length > 1) {
          // Marcar todos exceto o último como renovado
          for (let i = 0; i < lista.length - 1; i++) {
            procedimentosProcessados.push({
              ...lista[i],
              status_calculado: 'renovado'
            });
          }
          // O último mantém o status original (será calculado normalmente)
          procedimentosProcessados.push({
            ...lista[lista.length - 1],
            status_calculado: ''
          });
        } else {
          // Se só tem um procedimento deste tipo, não é renovado
          procedimentosProcessados.push({
            ...lista[0],
            status_calculado: ''
          });
        }
      });

      // Adicionar procedimentos sem nome (não agrupados)
      procedimentos.forEach(proc => {
        const nomeProc = proc.procedimento_tabela_valores_id?.nome_procedimento;
        if (!nomeProc) {
          procedimentosProcessados.push({
            ...proc,
            status_calculado: ''
          });
        }
      });

      // Ordenar por data decrescente para exibição
      procedimentosProcessados.sort((a, b) => {
        if (!a.data_procedimento || !b.data_procedimento) return 0;
        return new Date(b.data_procedimento).getTime() - new Date(a.data_procedimento).getTime();
      });

      setProcedimentosComStatus(procedimentosProcessados);
    };

    if (procedimentos.length > 0) {
      processarProcedimentos();
    } else {
      setProcedimentosComStatus([]);
    }
  }, [procedimentos]);

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
          {procedimentosComStatus.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center py-12 text-slate-400 text-lg">Nenhum procedimento encontrado.</td>
            </tr>
          ) : (
            procedimentosComStatus.map((proc, idx) => {
              const nome = proc.procedimento_tabela_valores_id?.nome_procedimento || 'N/A';
              const duracaoOriginal = proc.procedimento_tabela_valores_id?.duracao_efeito_meses;
              
              // Buscar duração da tabela de valores com normalização consistente
              const chaveLookup = String(nome).toLowerCase().trim();
              const duracaoTabela = mapaDuracaoProcedimentos.get(chaveLookup);
              const duracaoFinal = duracaoTabela || duracaoOriginal;
              
              // Usar a mesma lógica de status da página /procedimentos
              const statusInfo = calcularStatusComRenovado(proc, duracaoFinal ?? null);

              return (
                <tr key={proc.id} className={`transition-all ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-blue-50 group`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-700 text-center">{formatDate(proc.data_procedimento)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800 font-medium text-center">{nome}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-base font-bold text-green-600 text-center">{formatCurrency(proc.valor_cobrado)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 text-center">{duracaoFinal ? `${duracaoFinal} meses` : 'N/A'}</td>
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
