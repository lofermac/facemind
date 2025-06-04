// app/dashboard/page.tsx (ou seu arquivo de dashboard)
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import CardMetric from '@/components/CardMetric'; 
import CardPerformance from '@/components/CardPerformance'; 
import CardTopProcedimentos from '@/components/CardTopProcedimentos'; 
import { supabase } from '@/utils/supabaseClient';
import { toast } from 'sonner';

import { 
  UsersIcon, CheckCircleIcon, BellIcon, UserMinusIcon, ClockIcon,
  CurrencyDollarIcon, ScaleIcon, ReceiptPercentIcon, 
  ClipboardDocumentListIcon, ArrowUpIcon, SparklesIcon, // Mantendo seus ícones
  ArrowTrendingUpIcon, ArrowTrendingDownIcon // Ícones para performance
} from '@heroicons/react/24/outline'; 

// Tipos (ajustados para clareza na dashboard)
interface ProcedimentoRealizadoParaCalculo {
  data_procedimento: string | null;
  procedimento_nome: string | null;
  // Adicionando campos para cálculo de faturamento se eles vierem da query de procedimentos
  valor_cobrado?: number | null;
  custo_produto?: number | null;
  custo_insumos?: number | null;
  custo_sala?: number | null;
}

interface PacienteParaCalculo {
  id: string;
  status: 'Ativo' | 'Inativo' | null;
  procedimentos_realizados?: ProcedimentoRealizadoParaCalculo[];
}

interface DashboardData {
  pacientesAContatar: number;
  pacientesAtivosProcedimento: number;
  pacientesVencidos: number;
  pacientesInativosBanco: number;
  
  procedimentosMesAtual: number;
  faturamentoMesAtual: number;
  lucroMesAtual: number;
  ticketMedioMesAtual: number;
  topProcedimentos: { nome: string; quantidade: number }[];

  // Novas propriedades para o CardPerformance
  variacaoPercentualFaturamento: number; // Pode ser negativo
  isVariacaoFaturamentoPositiva: boolean;
  mediaFaturamento6MesesAnteriores: number;
}

const initialDashboardData: DashboardData = {
  pacientesAContatar: 0,
  pacientesAtivosProcedimento: 0,
  pacientesVencidos: 0,
  pacientesInativosBanco: 0,
  procedimentosMesAtual: 0,
  faturamentoMesAtual: 0,
  lucroMesAtual: 0,
  ticketMedioMesAtual: 0,
  topProcedimentos: [],
  variacaoPercentualFaturamento: 0,
  isVariacaoFaturamentoPositiva: false,
  mediaFaturamento6MesesAnteriores: 0,
};

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData>(initialDashboardData);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const hojeUtc = new Date();
      hojeUtc.setUTCHours(0, 0, 0, 0);
      
      // --- 1. Buscar durações dos tipos de procedimento ---
      const { data: tiposProcedimentoData, error: errorTipos } = await supabase
        .from('procedimentos_tabela_valores')
        .select('nome_procedimento, duracao_efeito_meses')
        .not('duracao_efeito_meses', 'is', null)
        .gt('duracao_efeito_meses', 0);

      if (errorTipos) {
        console.error('Erro ao buscar tipos de procedimento:', errorTipos);
        throw errorTipos;
      }

      const mapaDuracao = new Map<string, number>();
      if (tiposProcedimentoData) {
        tiposProcedimentoData.forEach(tipo => {
          if (tipo.nome_procedimento && typeof tipo.duracao_efeito_meses === 'number') {
            mapaDuracao.set(String(tipo.nome_procedimento).toLowerCase(), tipo.duracao_efeito_meses);
          }
        });
      }

      // --- 2. Buscar pacientes para cálculo de status ---
      const { data: pacientesBase, error: errorPacientes } = await supabase
        .from('pacientes')
        .select('id, status, procedimentos_realizados(data_procedimento, procedimento_nome)');

      if (errorPacientes) {
        console.error('Erro ao buscar pacientes:', errorPacientes);
        throw errorPacientes;
      }

      let contagemStatus = { contatar: 0, ativosProcedimento: 0, vencidos: 0, inativosBanco: 0 };
      if (pacientesBase) {
        pacientesBase.forEach((paciente: PacienteParaCalculo) => {
          if (paciente.status === 'Inativo') {
            contagemStatus.inativosBanco++;
          } else {
            const procsRealizados = paciente.procedimentos_realizados || [];
            if (procsRealizados.length > 0) {
              const procsOrdenados = [...procsRealizados].sort((a, b) => {
                if (!a.data_procedimento || !b.data_procedimento) return 0;
                return new Date(b.data_procedimento).getTime() - new Date(a.data_procedimento).getTime();
              });
              const ultimoProcedimento = procsOrdenados[0];

              if (ultimoProcedimento && ultimoProcedimento.data_procedimento && ultimoProcedimento.procedimento_nome) {
                const chaveLookup = String(ultimoProcedimento.procedimento_nome).toLowerCase();
                const duracaoMeses = mapaDuracao.get(chaveLookup);

                if (duracaoMeses !== undefined && duracaoMeses > 0) {
                  const dataRealizacao = new Date(ultimoProcedimento.data_procedimento);
                  dataRealizacao.setUTCHours(0, 0, 0, 0);
                  const dataVencimento = new Date(dataRealizacao.getTime());
                  dataVencimento.setUTCMonth(dataVencimento.getUTCMonth() + duracaoMeses);
                  const diffDiasParaVencer = Math.floor((dataVencimento.getTime() - hojeUtc.getTime()) / (1000 * 60 * 60 * 24));

                  if (diffDiasParaVencer < 0) contagemStatus.vencidos++;
                  else if (diffDiasParaVencer <= 30) contagemStatus.contatar++;
                  else contagemStatus.ativosProcedimento++;
                }
              }
            }
          }
        });
      }

      // --- 3. Métricas de Procedimentos do Mês Atual (Faturamento, Lucro, etc.) ---
      const primeiroDiaMesAtual = new Date(hojeUtc.getFullYear(), hojeUtc.getUTCMonth(), 1).toISOString().split('T')[0];
      const ultimoDiaMesAtual = new Date(hojeUtc.getFullYear(), hojeUtc.getUTCMonth() + 1, 0).toISOString().split('T')[0];

      const { data: procedimentosMesAtual, error: errorProcedimentosMes } = await supabase
        .from('procedimentos_realizados')
        .select('valor_cobrado, custo_produto, custo_insumos, custo_sala, procedimento_nome')
        .gte('data_procedimento', primeiroDiaMesAtual)
        .lte('data_procedimento', ultimoDiaMesAtual);
      if (errorProcedimentosMes) {
        console.error('Erro ao buscar procedimentos do mês atual:', errorProcedimentosMes);
        throw errorProcedimentosMes;
      }

      let faturamentoDoMesAtual = 0; let lucroDoMesAtual = 0;
      const numProcedimentosDoMesAtual = procedimentosMesAtual?.length || 0;
      const contagemProcedimentosDoMesAtual: { [key: string]: number } = {};

      if (procedimentosMesAtual) {
        for (const proc of procedimentosMesAtual) {
          faturamentoDoMesAtual += proc.valor_cobrado || 0;
          const custoTotalProc = (proc.custo_produto || 0) + (proc.custo_insumos || 0) + (proc.custo_sala || 0);
          lucroDoMesAtual += (proc.valor_cobrado || 0) - custoTotalProc;
          if (proc.procedimento_nome) {
            contagemProcedimentosDoMesAtual[proc.procedimento_nome] = (contagemProcedimentosDoMesAtual[proc.procedimento_nome] || 0) + 1;
          }
        }
      }
      const ticketMedioDoMesAtual = numProcedimentosDoMesAtual > 0 ? faturamentoDoMesAtual / numProcedimentosDoMesAtual : 0;
      const topProcedimentosArray = Object.entries(contagemProcedimentosDoMesAtual)
        .map(([nome, quantidade]) => ({ nome, quantidade }))
        .sort((a, b) => b.quantidade - a.quantidade)
        .slice(0, 3);

      // --- 4. Calcular Média de Faturamento dos Últimos 6 Meses Anteriores ---
      const faturamentos6MesesAnteriores: number[] = [];
      for (let i = 1; i <= 6; i++) {
        const dataReferenciaMesAnterior = new Date(hojeUtc.getFullYear(), hojeUtc.getUTCMonth() - i, 1);
        const primeiroDia = dataReferenciaMesAnterior.toISOString().split('T')[0];
        const ultimoDia = new Date(dataReferenciaMesAnterior.getFullYear(), dataReferenciaMesAnterior.getUTCMonth() + 1, 0).toISOString().split('T')[0];
        
        const { data: procsMes, error: errProcs } = await supabase
          .from('procedimentos_realizados')
          .select('valor_cobrado')
          .gte('data_procedimento', primeiroDia)
          .lte('data_procedimento', ultimoDia);

        if (errProcs) {
          console.warn(`Erro ao buscar faturamento do mês ${i} anterior:`, errProcs.message);
          faturamentos6MesesAnteriores.push(0); // Adiciona 0 se houver erro para não quebrar a média
        } else {
          let faturamentoMensal = 0;
          if (procsMes) {
            procsMes.forEach(p => faturamentoMensal += p.valor_cobrado || 0);
          }
          faturamentos6MesesAnteriores.push(faturamentoMensal);
        }
      }
      
      const somaFaturamentosAnteriores = faturamentos6MesesAnteriores.reduce((acc, val) => acc + val, 0);
      // Evita divisão por zero se não houver dados ou todos forem erro
      const mediaFaturamento6Meses = faturamentos6MesesAnteriores.length > 0 ? somaFaturamentosAnteriores / faturamentos6MesesAnteriores.length : 0; 

      let variacaoPercentual = 0;
      let isPositiva = false;

      if (mediaFaturamento6Meses > 0) {
        variacaoPercentual = ((faturamentoDoMesAtual - mediaFaturamento6Meses) / mediaFaturamento6Meses) * 100;
        isPositiva = faturamentoDoMesAtual >= mediaFaturamento6Meses;
      } else if (faturamentoDoMesAtual > 0) {
        variacaoPercentual = 100; // Crescimento "infinito" se a média era 0
        isPositiva = true;
      }
      // Se ambos são 0, variação é 0 e isPositiva é false (ou true, dependendo da preferência)

      setDashboardData({
        pacientesAContatar: contagemStatus.contatar,
        pacientesAtivosProcedimento: contagemStatus.ativosProcedimento,
        pacientesVencidos: contagemStatus.vencidos,
        pacientesInativosBanco: contagemStatus.inativosBanco,
        procedimentosMesAtual: numProcedimentosDoMesAtual,
        faturamentoMesAtual: faturamentoDoMesAtual,
        lucroMesAtual: lucroDoMesAtual,
        ticketMedioMesAtual: ticketMedioDoMesAtual,
        topProcedimentos: topProcedimentosArray,
        variacaoPercentualFaturamento: variacaoPercentual,
        isVariacaoFaturamentoPositiva: isPositiva,
        mediaFaturamento6MesesAnteriores: mediaFaturamento6Meses,
      });

    } catch (error: any) {
      console.error("Erro detalhado ao buscar dados do dashboard:", error);
      toast.error("Falha ao carregar dados do dashboard: " + (error.message || "Erro desconhecido"));
      setDashboardData(initialDashboardData);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  if (loading) return (
    <div className="p-6 text-center flex justify-center items-center min-h-[calc(100vh-100px)]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-sky-500 mr-3"></div>
      Carregando dados do Dashboard...
    </div>
  );
  
  const metricasLinha1 = [
    { title: "Pacientes Ativos", value: dashboardData.pacientesAtivosProcedimento, IconComponent: CheckCircleIcon, iconColor: "text-green-500" }, 
    { title: "Pacientes a Contatar", value: dashboardData.pacientesAContatar, IconComponent: BellIcon, iconColor: "text-orange-500" },
    { title: "Pacientes Vencidos", value: dashboardData.pacientesVencidos, IconComponent: ClockIcon, iconColor: "text-red-600" },
    { title: "Pacientes Inativos", value: dashboardData.pacientesInativosBanco, IconComponent: UserMinusIcon, iconColor: "text-slate-500" },
  ];

  const metricasLinha2 = [
    { title: "Faturamento Mensal", value: formatCurrency(dashboardData.faturamentoMesAtual), IconComponent: CurrencyDollarIcon, iconColor: "text-gray-500" },
    { title: "Lucro Mensal", value: formatCurrency(dashboardData.lucroMesAtual), IconComponent: ScaleIcon, iconColor: "text-gray-500" },
    { title: "Ticket Médio", value: formatCurrency(dashboardData.ticketMedioMesAtual), IconComponent: ReceiptPercentIcon, iconColor: "text-gray-500" },
    { title: "Procedimentos (Mês)", value: dashboardData.procedimentosMesAtual, IconComponent: ClipboardDocumentListIcon, iconColor: "text-gray-500" },
  ];

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="grid grid-cols-1 gap-5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {metricasLinha1.map((item) => (
            <CardMetric key={item.title} title={item.title} value={item.value.toString()} IconComponent={item.IconComponent} iconColor={item.iconColor} />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {metricasLinha2.map((item) => (
            <CardMetric key={item.title} title={item.title} value={item.value.toString()} IconComponent={item.IconComponent} iconColor={item.iconColor} />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1"> 
            <CardPerformance
              title="Performance do Faturamento" 
              currentValue={formatCurrency(dashboardData.faturamentoMesAtual)}
              percentageChange={`${dashboardData.variacaoPercentualFaturamento.toFixed(2)}%`}
              isPositive={dashboardData.isVariacaoFaturamentoPositiva}
              periodDescription={`vs. média dos últimos 6 meses (${formatCurrency(dashboardData.mediaFaturamento6MesesAnteriores)})`}
              Icon={dashboardData.isVariacaoFaturamentoPositiva ? ArrowTrendingUpIcon : ArrowTrendingDownIcon}
            />
          </div>
          <div className="lg:col-span-2"> 
            <CardTopProcedimentos 
              title="Top 3 Procedimentos (Mês Atual)" 
              subtitle="Procedimentos mais realizados este mês"
              procedimentos={dashboardData.topProcedimentos} 
              Icon={SparklesIcon} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}