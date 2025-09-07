 // app/dashboard/page.tsx (ou seu arquivo de dashboard)
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import CardMetric from '@/components/CardMetric'; 
import CardPerformance from '@/components/CardPerformance'; 
import CardTopProcedimentos from '@/components/CardTopProcedimentos'; 
import CardAniversarios from '@/components/CardAniversarios';
import { supabase } from '@/utils/supabaseClient';
import { toast } from 'sonner';
import AppleLikeLoader from '@/components/AppleLikeLoader';
import SkeletonLoader from '@/components/SkeletonLoader';
import ErrorBoundary from '@/components/ErrorBoundary';
import { hasFutureAppointmentLike, latestByProcedureName, derivePatientStatusFromProcedures, calcProcedureStatus } from '@/utils/statusRules';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import ChartRevenueArea from '@/components/ChartRevenueArea';
import RadarPatientsStatus from '@/components/RadarPatientsStatus';
import StackedBarProcedures from '@/components/StackedBarProcedures';
import RadialProgressRevenue from '@/components/RadialProgressRevenue';
import ForecastRevenueChart from '@/components/ForecastRevenueChart';
import CardProximosAtendimentos, { ProximoAtendimento } from '@/components/CardProximosAtendimentos';
import QuickTasksWidget from '@/components/QuickTasksWidget';
import WidgetRadarOportunidades, { ProcedimentoOportunidade } from '@/components/WidgetRadarOportunidades';
import WidgetRadarRenovacoes, { ProcedimentoRenovacao } from '@/components/WidgetRadarRenovacoes';
import WidgetRadarCarteiraAtivos, { ProcedimentoAtivoResumo } from '@/components/WidgetRadarCarteiraAtivos';
import WidgetRadarChurn, { PacienteChurn } from '@/components/WidgetRadarChurn';
import CampanhasMarketingWidget from '@/components/CampanhasMarketingWidget';

import { 
  UsersIcon, CheckCircleIcon, BellIcon, UserMinusIcon, ClockIcon,
  CurrencyDollarIcon, ScaleIcon, ReceiptPercentIcon, 
  ClipboardDocumentListIcon, ArrowUpIcon, SparklesIcon, // Mantendo seus ícones
  ArrowTrendingUpIcon, ArrowTrendingDownIcon // Ícones para performance
} from '@heroicons/react/24/outline'; 

// Tipos (ajustados para clareza na dashboard)
interface ProcedimentoRealizadoParaCalculo {
  data_procedimento: string | null;
  procedimento_nome?: string | null;
  // Quando carregado via relacionamento do Supabase
  procedimento_tabela_valores_id?: {
    nome_procedimento?: string | null;
    categorias_procedimentos?: { nome?: string | null } | null;
  } | null;
  // Adicionando campos para cálculo de faturamento se eles vierem da query de procedimentos
  valor_cobrado?: number | null;
  custo_produto?: number | null;
  custo_insumos?: number | null;
  custo_sala?: number | null;
}

interface PacienteParaCalculo {
  id: string;
  nome: string;  // novo campo para aniversários
  data_nascimento: string | null; // YYYY-MM-DD
  whatsapp: string | null; // campo para WhatsApp
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
  aniversariantesDoMes: { id: string; nome: string; dia: number; whatsapp: string | null }[]; // novo
  monthlyRevenue: { label: string; value: number }[];
  stackedProcData: any[];
  stackedCategories: string[];
  percentRevenueTarget: number;
  forecastRevenueData: { label: string; value: number; isForecast?: boolean }[];
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
  aniversariantesDoMes: [],
  monthlyRevenue: [],
  stackedProcData: [],
  stackedCategories: [],
  percentRevenueTarget: 0,
  forecastRevenueData: [],
};

// Função para criar tarefas de lembrete de aniversário
async function criarTarefasLembreteAniversario(pacientes: PacienteParaCalculo[] | null, hoje: Date) {
  if (!pacientes) return;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  for (const paciente of pacientes) {
    if (!paciente.data_nascimento) continue;

    const [anoStr, mesStr, diaStr] = paciente.data_nascimento.split('-');
    const mesNascimento = parseInt(mesStr, 10);
    const diaNascimento = parseInt(diaStr, 10);

    // Calcular data do aniversário deste ano
    const anoAtual = hoje.getFullYear();
    const aniversarioEsteAno = new Date(anoAtual, mesNascimento - 1, diaNascimento);
    
    // Se o aniversário já passou este ano, considerar o próximo ano
    if (aniversarioEsteAno < hoje) {
      aniversarioEsteAno.setFullYear(anoAtual + 1);
    }

    // Calcular 15 dias antes do aniversário
    const dataLembrete = new Date(aniversarioEsteAno);
    dataLembrete.setDate(dataLembrete.getDate() - 15);

    // Verificar se hoje é exatamente 15 dias antes do aniversário
    const diffDias = Math.floor((dataLembrete.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDias === 0) {
      // Verificar se já existe uma tarefa para este aniversário
      const descricaoTarefa = `Aniversário - ${paciente.nome}`;
      
      const { data: tarefaExistente } = await supabase
        .from('tarefas')
        .select('id')
        .eq('user_id', user.id)
        .eq('descricao', descricaoTarefa)
        .eq('is_completa', false)
        .single();

      // Se não existe tarefa, criar uma nova
      if (!tarefaExistente) {
        await supabase
          .from('tarefas')
          .insert({
            user_id: user.id,
            descricao: descricaoTarefa,
            is_completa: false
          });
      }
    }
  }
}

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData>(initialDashboardData);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string>('');
  const [proximosAtendimentos, setProximosAtendimentos] = useState<ProximoAtendimento[]>([]);
  const [oportunidadesQuentes, setOportunidadesQuentes] = useState<ProcedimentoOportunidade[]>([]);
  const [renovacoesAtrasadas, setRenovacoesAtrasadas] = useState<ProcedimentoRenovacao[]>([]);
  const [carteiraAtivos, setCarteiraAtivos] = useState<ProcedimentoAtivoResumo[]>([]);
  const [pacientesChurn, setPacientesChurn] = useState<PacienteChurn[]>([]);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const hojeUtc = new Date();
      hojeUtc.setUTCHours(0, 0, 0, 0);
      
      // 🚀 OTIMIZAÇÃO: Uma única query para buscar TODOS os dados necessários
      const [
        { data: tiposProcedimentoData, error: errorTipos },
        { data: pacientesBase, error: errorPacientes },
        { data: procedimentosParaFinanceiro, error: errorFinanceiro }
      ] = await Promise.all([
        // Query 1: Durações dos procedimentos
        supabase
          .from('procedimentos_tabela_valores')
          .select('nome_procedimento, duracao_efeito_meses')
          .not('duracao_efeito_meses', 'is', null)
          .gt('duracao_efeito_meses', 0),
        
        // Query 2: Pacientes com procedimentos (mais completa)
        supabase
          .from('pacientes')
          .select(`
            id, nome, status, data_nascimento, whatsapp,
            procedimentos_realizados(
              id, data_procedimento, valor_cobrado, custo_produto, custo_insumos, custo_sala,
              procedimento_tabela_valores_id ( nome_procedimento, duracao_efeito_meses )
            )
          `),
        
        // Query 3: Procedimentos para cálculos financeiros (últimos 7 meses)
        supabase
          .from('procedimentos_realizados')
          .select('data_procedimento, valor_cobrado, custo_produto, custo_insumos, custo_sala, categoria_nome')
          .gte('data_procedimento', new Date(hojeUtc.getFullYear(), hojeUtc.getUTCMonth() - 6, 1).toISOString().split('T')[0])
      ]);

      if (errorTipos) {
        console.error('Erro ao buscar tipos de procedimento:', errorTipos);
        throw errorTipos;
      }
      if (errorPacientes) {
        console.error('Erro ao buscar pacientes:', errorPacientes);
        throw errorPacientes;
      }
      if (errorFinanceiro) {
        console.error('Erro ao buscar dados financeiros:', errorFinanceiro);
        throw errorFinanceiro;
      }

      // Processar mapa de durações com normalização consistente
      const mapaDuracao = new Map<string, number>();
      if (tiposProcedimentoData) {
        tiposProcedimentoData.forEach(tipo => {
          if (tipo.nome_procedimento && typeof tipo.duracao_efeito_meses === 'number') {
            // Usar normalização consistente (trim + toLowerCase)
            const nomeNormalizado = String(tipo.nome_procedimento).toLowerCase().trim();
            mapaDuracao.set(nomeNormalizado, tipo.duracao_efeito_meses);
          }
        });
      }

      if (errorPacientes) {
        console.error('Erro ao buscar pacientes:', errorPacientes);
        throw errorPacientes;
      }

      let pacientesComProcedimentoAtivo = new Set<string>();
      let pacientesAContatar = new Set<string>();
      let pacientesVencidos = new Set<string>();
      let pacientesInativosBanco = 0;

      if (pacientesBase) {
        pacientesBase.forEach((paciente: any) => {
          if (paciente.status === 'Inativo') {
            pacientesInativosBanco++;
            return;
          }
          
          // APLICAR LÓGICA DE RENOVAÇÃO: Agrupar por tipo de procedimento e considerar apenas o mais recente
          const mapaPorTipoProc: Record<string, Array<{ data: Date, proc: any }>> = {};
          (paciente.procedimentos_realizados || []).forEach((proc: any) => {
            const nomeProc = proc.procedimento_tabela_valores_id?.nome_procedimento;
            if (!proc.data_procedimento || !nomeProc) return;
            const chave = String(nomeProc).toLowerCase().trim();
            const dataRealizacao = new Date(proc.data_procedimento);
            dataRealizacao.setHours(0, 0, 0, 0);
            
            (mapaPorTipoProc[chave] = mapaPorTipoProc[chave] || []).push({
              data: dataRealizacao,
              proc: proc
            });
          });

          // Para cada tipo de procedimento, considerar apenas o mais recente
          const procsDepoisRenovacao: Array<{ data_procedimento: string; duracao_efeito_meses: number | null }> = [];
          Object.values(mapaPorTipoProc).forEach(lista => {
            lista.sort((a, b) => a.data.getTime() - b.data.getTime());
            if (lista.length > 0) {
              const maisRecente = lista[lista.length - 1]; // O último da lista (mais recente)
              const nomeProc = maisRecente.proc.procedimento_tabela_valores_id?.nome_procedimento;
              const chaveLookup = String(nomeProc || '').toLowerCase().trim();
              const duracaoMeses = mapaDuracao.get(chaveLookup);
              procsDepoisRenovacao.push({
                data_procedimento: maisRecente.proc.data_procedimento,
                duracao_efeito_meses: duracaoMeses !== undefined ? duracaoMeses : null
              });
            }
          });
          
          // Usar a mesma função que a página /pacientes usa
          const statusCalculado = derivePatientStatusFromProcedures({
            procedimentos: procsDepoisRenovacao,
            created_at: paciente.created_at,
            paciente_status_banco: paciente.status,
            today: hojeUtc
          });
          
          // Contar conforme o status calculado
          if (statusCalculado === 'Ativo') {
            pacientesComProcedimentoAtivo.add(paciente.id);
          } else if (statusCalculado === 'Contato') {
            pacientesAContatar.add(paciente.id);
          } else if (statusCalculado === 'Vencido') {
            pacientesVencidos.add(paciente.id);
          }
        });
      }

      // --- 3. Métricas de Procedimentos do Mês Atual (OTIMIZADO) ---
      const primeiroDiaMesAtual = new Date(hojeUtc.getFullYear(), hojeUtc.getUTCMonth(), 1).toISOString().split('T')[0];
      const ultimoDiaMesAtual = new Date(hojeUtc.getFullYear(), hojeUtc.getUTCMonth() + 1, 0).toISOString().split('T')[0];

      // 🚀 OTIMIZAÇÃO: Usar dados já carregados em vez de nova query
      const procedimentosMesAtual = procedimentosParaFinanceiro?.filter(proc => 
        proc.data_procedimento && 
        proc.data_procedimento >= primeiroDiaMesAtual && 
        proc.data_procedimento <= ultimoDiaMesAtual
      ) || [];

      let faturamentoDoMesAtual = 0; 
      let lucroDoMesAtual = 0;
      const numProcedimentosDoMesAtual = procedimentosMesAtual.length;
      const contagemProcedimentosDoMesAtual: { [key: string]: number } = {};

      // Processar dados financeiros
      for (const proc of procedimentosMesAtual) {
        faturamentoDoMesAtual += proc.valor_cobrado || 0;
        const custoTotalProc = (proc.custo_produto || 0) + (proc.custo_insumos || 0) + (proc.custo_sala || 0);
        lucroDoMesAtual += (proc.valor_cobrado || 0) - custoTotalProc;
        
        // Para top procedimentos, usar categoria_nome que já vem na query
        const categoria = proc.categoria_nome || 'Outros';
        contagemProcedimentosDoMesAtual[categoria] = (contagemProcedimentosDoMesAtual[categoria] || 0) + 1;
      }
      const ticketMedioDoMesAtual = numProcedimentosDoMesAtual > 0 ? faturamentoDoMesAtual / numProcedimentosDoMesAtual : 0;
      const topProcedimentosArray = Object.entries(contagemProcedimentosDoMesAtual)
        .map(([nome, quantidade]) => ({ nome, quantidade }))
        .sort((a, b) => b.quantidade - a.quantidade)
        .slice(0, 3);

      // --- 4. Calcular Média de Faturamento dos Últimos 6 Meses Anteriores (OTIMIZADO) ---
      const faturamentos6MesesAnteriores: number[] = [];
      
      // 🚀 OTIMIZAÇÃO: Processar dados já carregados por mês
      for (let i = 1; i <= 6; i++) {
        const dataReferenciaMesAnterior = new Date(hojeUtc.getFullYear(), hojeUtc.getUTCMonth() - i, 1);
        const primeiroDia = dataReferenciaMesAnterior.toISOString().split('T')[0];
        const ultimoDia = new Date(dataReferenciaMesAnterior.getFullYear(), dataReferenciaMesAnterior.getUTCMonth() + 1, 0).toISOString().split('T')[0];
        
        // Filtrar dados já carregados em vez de nova query
        const procsMes = procedimentosParaFinanceiro?.filter(proc => 
          proc.data_procedimento && 
          proc.data_procedimento >= primeiroDia && 
          proc.data_procedimento <= ultimoDia
        ) || [];

        const faturamentoMensal = procsMes.reduce((acc, p) => acc + (p.valor_cobrado || 0), 0);
        faturamentos6MesesAnteriores.push(faturamentoMensal);
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

      let aniversariantes: { id: string; nome: string; dia: number; whatsapp: string | null }[] = [];
      if (pacientesBase) {
        pacientesBase.forEach((paciente: any) => {
          if (paciente.data_nascimento) {
            const [anoStr, mesStr, diaStr] = paciente.data_nascimento.split('-');
            const mesInt = parseInt(mesStr, 10);
            const diaInt = parseInt(diaStr, 10);
            if (mesInt === hojeUtc.getUTCMonth() + 1) {
              // Inclui todos os aniversários do mês (não apenas do dia atual para frente)
              aniversariantes.push({ id: paciente.id, nome: paciente.nome, dia: diaInt, whatsapp: paciente.whatsapp });
            }
          }
        });
        aniversariantes.sort((a, b) => a.dia - b.dia);
      }

      // Criar tarefas de lembrete de aniversário (15 dias antes)
      await criarTarefasLembreteAniversario(pacientesBase as any, hojeUtc);

      const monthlyRevenueArray: { label: string; value: number }[] = [];
      // current month label
      const monthNamesPt = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
      monthlyRevenueArray.unshift({ label: monthNamesPt[hojeUtc.getUTCMonth()], value: faturamentoDoMesAtual });
      // Use loop results
      faturamentos6MesesAnteriores.forEach((valor, idx) => {
        const refDate = new Date(hojeUtc.getFullYear(), hojeUtc.getUTCMonth() - (idx + 1));
        monthlyRevenueArray.push({ label: monthNamesPt[refDate.getUTCMonth()], value: valor });
      });

      // --- 5. Procedimentos por Categoria (OTIMIZADO) ---
      const primeiroDia6MesesAtras = new Date(hojeUtc.getFullYear(), hojeUtc.getUTCMonth() - 5, 1);
      const dataInicioStr = primeiroDia6MesesAtras.toISOString().split('T')[0];

      // 🚀 OTIMIZAÇÃO: Usar dados já carregados para categorias
      const categoriasSet = new Set<string>();
      const mapaMesCategoria: Record<string, Record<string, number>> = {};
      
      // Processar dados já carregados (procedimentosParaFinanceiro já tem últimos 7 meses)
      if (procedimentosParaFinanceiro) {
        procedimentosParaFinanceiro.forEach(p => {
          if (!p.data_procedimento || p.data_procedimento < dataInicioStr) return;
          const dt = new Date(p.data_procedimento);
          const label = monthNamesPt[dt.getUTCMonth()];
          const categoria = p.categoria_nome || 'Outro';
          categoriasSet.add(categoria);
          mapaMesCategoria[label] = mapaMesCategoria[label] || {};
          mapaMesCategoria[label][categoria] = (mapaMesCategoria[label][categoria] || 0) + 1;
        });
      }
      const categoriasArr = Array.from(categoriasSet).slice(0, 5); // limite 5
      const stackedProcDataArray: any[] = monthlyRevenueArray.map(m => {
        const obj: any = { label: m.label };
        categoriasArr.forEach(cat => { obj[cat] = (mapaMesCategoria[m.label]?.[cat]) || 0; });
        return obj;
      });

      // --- 6. Percentual meta faturamento ---
      const targetRevenue = mediaFaturamento6Meses * 1.15; // 15% crescimento meta
      let percentRevenueTargetCalc = targetRevenue > 0 ? faturamentoDoMesAtual / targetRevenue : 0;
      if (percentRevenueTargetCalc > 1.25) percentRevenueTargetCalc = 1.25; // limitar para 125%

      // --- 7. Previsão faturamento próximos 3 meses ---
      const avgGrowth = faturamentos6MesesAnteriores.length > 1 ? faturamentos6MesesAnteriores.slice(1).reduce((acc, cur, idx)=>{
        const prev = faturamentos6MesesAnteriores[idx];
        return acc + (prev>0 ? (cur - prev)/prev : 0);
      },0)/(faturamentos6MesesAnteriores.length -1) : 0;
      const forecastData: { label: string; value: number; isForecast?: boolean }[] = [...monthlyRevenueArray].reverse().map(d=>({...d, isForecast:false}));
      let lastVal = faturamentoDoMesAtual;
      for(let i=1;i<=3;i++){
        lastVal = lastVal * (1+avgGrowth);
        const futureDate = new Date(hojeUtc.getFullYear(), hojeUtc.getUTCMonth()+i);
        forecastData.push({ label: monthNamesPt[futureDate.getUTCMonth()], value: lastVal, isForecast:true});
      }

      setDashboardData({
        pacientesAContatar: pacientesAContatar.size,
        pacientesAtivosProcedimento: pacientesComProcedimentoAtivo.size,
        pacientesVencidos: pacientesVencidos.size,
        pacientesInativosBanco: pacientesInativosBanco,
        procedimentosMesAtual: numProcedimentosDoMesAtual,
        faturamentoMesAtual: faturamentoDoMesAtual,
        lucroMesAtual: lucroDoMesAtual,
        ticketMedioMesAtual: ticketMedioDoMesAtual,
        topProcedimentos: topProcedimentosArray,
        variacaoPercentualFaturamento: variacaoPercentual,
        isVariacaoFaturamentoPositiva: isPositiva,
        mediaFaturamento6MesesAnteriores: mediaFaturamento6Meses,
        aniversariantesDoMes: aniversariantes,
        monthlyRevenue: monthlyRevenueArray.reverse(), // reverse to chronological
        stackedProcData: stackedProcDataArray, // Placeholder, will be populated by StackedBarProcedures
        stackedCategories: categoriasArr, // Placeholder, will be populated by StackedBarProcedures
        percentRevenueTarget: percentRevenueTargetCalc, // Placeholder, will be populated by RadialProgressRevenue
        forecastRevenueData: forecastData, // Placeholder, will be populated by ForecastRevenueChart
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

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const name = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuário';
      setUserName(name.charAt(0).toUpperCase() + name.slice(1));
    })();
  }, []);

  // Buscar próximos atendimentos (todos os futuros)
  const fetchProximosAtendimentos = useCallback(async () => {
    // Buscar todos os agendamentos futuros (sem limite de 7 dias)
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const { data: ags, error } = await supabase
      .from('agendamentos')
      .select('id, paciente_id, data, hora, rotulo')
      .gte('data', hoje.toISOString().slice(0, 10))
      .order('data', { ascending: true })
      .order('hora', { ascending: true });
    if (error || !Array.isArray(ags)) {
      setProximosAtendimentos([]);
      return;
    }
    // Buscar nomes dos pacientes (excluir inativos)
    const { data: pacientes } = await supabase
      .from('pacientes')
      .select('id, nome, status')
      .neq('status', 'Inativo');
    const pacientesMap: Record<string, string> = {};
    if (Array.isArray(pacientes)) {
      pacientes.forEach(p => { pacientesMap[p.id] = p.nome; });
    }
    // Montar lista final - filtrar agendamentos de pacientes inativos
    const atendimentos: ProximoAtendimento[] = ags
      .filter(a => pacientesMap[a.paciente_id]) // Só incluir se paciente não for inativo
      .map(a => ({
        id: a.id,
        paciente: pacientesMap[a.paciente_id],
        data: a.data,
        hora: a.hora,
        rotulo: a.rotulo || '',
      }));
    setProximosAtendimentos(atendimentos);
  }, []);

  useEffect(() => {
    fetchProximosAtendimentos();
  }, [fetchProximosAtendimentos]);

  useEffect(() => {
    async function fetchOportunidadesQuentes() {
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      // Buscar durações dos procedimentos
      const { data: tiposProcedimentoData } = await supabase
        .from('procedimentos_tabela_valores')
        .select('nome_procedimento, duracao_efeito_meses');
      const mapaDuracao = new Map<string, number>();
      if (tiposProcedimentoData) {
        tiposProcedimentoData.forEach(tipo => {
          if (tipo.nome_procedimento && typeof tipo.duracao_efeito_meses === 'number') {
            mapaDuracao.set(String(tipo.nome_procedimento).toLowerCase(), tipo.duracao_efeito_meses);
          }
        });
      }
      // Buscar pacientes e procedimentos realizados + agendamentos
      // FILTRAR pacientes inativos do widget de oportunidades
      const { data: pacientes } = await supabase
        .from('pacientes')
        .select('id, nome, status, procedimentos_realizados(id, data_procedimento, procedimento_tabela_valores_id ( nome_procedimento )), agendamentos(data, rotulo)')
        .neq('status', 'Inativo');
      const oportunidades: ProcedimentoOportunidade[] = [];
      if (pacientes) {
        pacientes.forEach(paciente => {
          // APLICAR LÓGICA DE RENOVAÇÃO: Agrupar por paciente + tipo de procedimento
          const mapaPorPacienteEProc: Record<string, Array<{ data: Date, proc: any }>> = {};
          (paciente.procedimentos_realizados || []).forEach(proc => {
            const nomeProc = (proc as any).procedimento_tabela_valores_id?.nome_procedimento;
            if (!proc.data_procedimento || !nomeProc) return;
            const chave = `${paciente.id}-${String(nomeProc).toLowerCase()}`;
            const dataRealizacao = new Date(proc.data_procedimento);
            dataRealizacao.setHours(0, 0, 0, 0);
            
            (mapaPorPacienteEProc[chave] = mapaPorPacienteEProc[chave] || []).push({
              data: dataRealizacao,
              proc: proc
            });
          });

          // Para cada grupo, considerar apenas o procedimento mais recente
          Object.values(mapaPorPacienteEProc).forEach(lista => {
            lista.sort((a, b) => a.data.getTime() - b.data.getTime());
            if (lista.length > 0) {
              const maisRecente = lista[lista.length - 1]; // O último da lista (mais recente)
              const proc = maisRecente.proc;
              const nomeProc = (proc as any).procedimento_tabela_valores_id?.nome_procedimento;
              const chave = String(nomeProc).toLowerCase();
              const duracao = mapaDuracao.get(chave);
              if (!duracao) return;
              
              const { status, dias } = calcProcedureStatus(proc.data_procedimento, duracao, hoje);
              const diffDias = dias;
              if (diffDias !== null && diffDias >= 0 && diffDias <= 30) {
                // Apenas procedimentos próximos ao vencimento (não renovados)
                oportunidades.push({
                  id: `${paciente.id}-${(proc as any).data_procedimento}-${(proc as any).id}-${((proc as any).procedimento_tabela_valores_id?.nome_procedimento || '')}`,
                  nome: nomeProc,
                  paciente: paciente.nome,
                  diasParaVencer: diffDias,
                });
              }
            }
          });
        });
      }
      oportunidades.sort((a, b) => a.diasParaVencer - b.diasParaVencer);
      setOportunidadesQuentes(oportunidades);
    }
    fetchOportunidadesQuentes();
  }, []);

  useEffect(() => {
    async function fetchRadarWidgets() {
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      // Buscar durações dos procedimentos
      const { data: tiposProcedimentoData } = await supabase
        .from('procedimentos_tabela_valores')
        .select('nome_procedimento, duracao_efeito_meses');
      const mapaDuracao = new Map<string, number>();
      if (tiposProcedimentoData) {
        tiposProcedimentoData.forEach(tipo => {
          if (tipo.nome_procedimento && typeof tipo.duracao_efeito_meses === 'number') {
            mapaDuracao.set(String(tipo.nome_procedimento).toLowerCase(), tipo.duracao_efeito_meses);
          }
        });
      }
      // 1) Construir Carteira aplicando lógica de renovação
      const { data: procsCarteira } = await supabase
        .from('procedimentos_realizados')
        .select('paciente_id, data_procedimento, categoria_nome, procedimento_tabela_valores_id ( nome_procedimento, duracao_efeito_meses, categorias_procedimentos ( nome ) )');

      // Agrupar por paciente + tipo de procedimento para aplicar lógica de renovação
      const mapaCarteiraRenovacao: Record<string, Array<{ data: Date, rec: any }>> = {};
      (procsCarteira || []).forEach((rec: any) => {
        const nomeProc = rec?.procedimento_tabela_valores_id?.nome_procedimento;
        if (!rec.data_procedimento || !nomeProc) return;
        const chave = `${rec.paciente_id}-${String(nomeProc).toLowerCase()}`;
        const dataRealizacao = new Date(rec.data_procedimento);
        dataRealizacao.setHours(0, 0, 0, 0);
        
        (mapaCarteiraRenovacao[chave] = mapaCarteiraRenovacao[chave] || []).push({
          data: dataRealizacao,
          rec: rec
        });
      });

      const ativosDiretos: Record<string, number> = {};
      // Para cada grupo, considerar apenas o procedimento mais recente
      Object.values(mapaCarteiraRenovacao).forEach(lista => {
        lista.sort((a, b) => a.data.getTime() - b.data.getTime());
        if (lista.length > 0) {
          const maisRecente = lista[lista.length - 1]; // O último da lista (mais recente)
          const rec = maisRecente.rec;
          const dataProc = rec?.data_procedimento;
          const dur = rec?.procedimento_tabela_valores_id?.duracao_efeito_meses as number | null | undefined;
          if (!dataProc || !dur || dur <= 0) return;
          
          // Usar a mesma função que a página /procedimentos usa
          const { status } = calcProcedureStatus(dataProc, dur, hoje);
          if (status === 'ativo') {
            const cat = rec?.categoria_nome
              || rec?.procedimento_tabela_valores_id?.categorias_procedimentos?.nome
              || rec?.procedimento_tabela_valores_id?.nome_procedimento
              || 'Outros';
            ativosDiretos[cat] = (ativosDiretos[cat] || 0) + 1;
          }
        }
      });

      // Buscar pacientes e procedimentos realizados (para os outros widgets)
      // FILTRAR pacientes inativos dos widgets de renovação e churn
      const { data: pacientes } = await supabase
        .from('pacientes')
        .select('id, nome, status, procedimentos_realizados(id, data_procedimento, procedimento_tabela_valores_id ( nome_procedimento, categoria_id, categorias_procedimentos ( nome ) )), agendamentos(data, rotulo)')
        .neq('status', 'Inativo');
      // --- Renovações Atrasadas ---
      const renovacoes: ProcedimentoRenovacao[] = [];
      // --- Carteira de Procedimentos Ativos ---
      const ativosPorTipo: Record<string, number> = {};
      // --- Alerta de Churn ---
      const churn: PacienteChurn[] = [];
      if (pacientes) {
        pacientes.forEach(paciente => {
          // Agrupar procedimentos por paciente e tipo de procedimento
          const mapaPorPacienteEProc: Record<string, Array<{ data: Date, proc: any }>> = {};
          (paciente.procedimentos_realizados || []).forEach(proc => {
            const nomeProc = (proc as any).procedimento_tabela_valores_id?.nome_procedimento;
            if (!proc.data_procedimento || !nomeProc) return;
            const chave = `${paciente.id}-${String(nomeProc).toLowerCase()}`;
            const dataRealizacao = new Date(proc.data_procedimento);
            dataRealizacao.setHours(0, 0, 0, 0);
            
            (mapaPorPacienteEProc[chave] = mapaPorPacienteEProc[chave] || []).push({
              data: dataRealizacao,
              proc: proc
            });
          });

          // Para cada grupo, ordenar por data e marcar todos exceto o mais recente como renovado
          Object.values(mapaPorPacienteEProc).forEach(lista => {
            lista.sort((a, b) => a.data.getTime() - b.data.getTime());
            // Processar apenas o procedimento mais recente de cada tipo
            if (lista.length > 0) {
              const maisRecente = lista[lista.length - 1]; // O último da lista (mais recente)
              const proc = maisRecente.proc;
              const nomeProc = (proc as any).procedimento_tabela_valores_id?.nome_procedimento;
              const chave = String(nomeProc).toLowerCase();
              const duracao = mapaDuracao.get(chave);
              
              if (duracao) {
                const dataRealizacao = maisRecente.data;
                const dataVencimento = new Date(dataRealizacao.getTime());
                dataVencimento.setMonth(dataVencimento.getMonth() + duracao);
                const diffDias = Math.floor((dataVencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
                
                // --- Renovações Atrasadas ---
                const { status, dias } = calcProcedureStatus(dataRealizacao.toISOString().slice(0,10), duracao, hoje);
                if (status === 'vencido' && dias !== null && dias <= 180) {
                  renovacoes.push({
                    id: `${paciente.id}-${proc.data_procedimento}-${proc.id}-${nomeProc}`,
                    nome: nomeProc,
                    paciente: paciente.nome,
                    diasVencido: dias,
                  });
                }
              }
            }
          });

          // --- Alerta de Churn ---
          let ultimoProc: { data: Date, nome: string } | null = null;
          (paciente.procedimentos_realizados || []).forEach(proc => {
            const nomeProc = (proc as any).procedimento_tabela_valores_id?.nome_procedimento;
            if (!proc.data_procedimento || !nomeProc) return;
            const dataRealizacao = new Date(proc.data_procedimento);
            dataRealizacao.setHours(0, 0, 0, 0);
            
            if (!ultimoProc || dataRealizacao > ultimoProc.data) {
              ultimoProc = { data: dataRealizacao, nome: nomeProc };
            }
          });
          // Alerta de Churn: se último procedimento > 6 meses atrás (180 dias)
          if (ultimoProc) {
            const diffDias = Math.floor((hoje.getTime() - (ultimoProc as any).data.getTime()) / (1000 * 60 * 60 * 24));
            const diffMeses = Math.floor(diffDias / 30); // Aproximação: 30 dias = 1 mês
            if (diffDias >= 180) { // 6 meses = 180 dias (consistente com CHURN_MONTHS * 30)
              churn.push({
                id: paciente.id,
                nome: paciente.nome,
                mesesSemVisita: diffMeses,
              });
            }
          }
        });
      }
      renovacoes.sort((a, b) => b.diasVencido - a.diasVencido);
      setRenovacoesAtrasadas(renovacoes);
      setCarteiraAtivos(Object.entries(ativosDiretos).map(([nome, quantidade]) => ({ nome, quantidade })).sort((a, b) => b.quantidade - a.quantidade));
      churn.sort((a, b) => b.mesesSemVisita - a.mesesSemVisita);
      setPacientesChurn(churn);
    }
    fetchRadarWidgets();
  }, []);

  const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 });

  if (loading) return (
    <div className="py-6 px-3 sm:px-6 lg:px-8 bg-slate-50 min-h-screen">
      <div className="max-w-3xl md:max-w-7xl mx-auto space-y-6 md:space-y-8">
        {/* Skeleton para Tarefas Rápidas + Próximos Atendimentos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SkeletonLoader type="widget" />
          <SkeletonLoader type="list" />
        </div>
        
        {/* Skeleton para KPIs */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-5 md:grid-cols-2 lg:grid-cols-4">
          <SkeletonLoader type="metric" />
          <SkeletonLoader type="metric" />
          <SkeletonLoader type="metric" />
          <SkeletonLoader type="metric" />
        </div>
        
        {/* Skeleton para Widgets principais */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <SkeletonLoader type="widget" />
          <SkeletonLoader type="widget" />
          <SkeletonLoader type="widget" />
          <SkeletonLoader type="widget" />
        </div>
        
        {/* Skeleton para Aniversários + Campanhas */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <SkeletonLoader type="list" />
          <SkeletonLoader type="card" />
        </div>
      </div>
    </div>
  );
  
  const metricasLinha1 = [
    { title: "Pacientes Ativos", value: dashboardData.pacientesAtivosProcedimento, IconComponent: CheckCircleIcon, iconColor: "text-green-500", key: 'ativos' }, 
    { title: "Pacientes a Contatar", value: dashboardData.pacientesAContatar, IconComponent: BellIcon, iconColor: "text-orange-500", key: 'contatar' },
    { title: "Pacientes Vencidos", value: dashboardData.pacientesVencidos, IconComponent: ClockIcon, iconColor: "text-red-600", key: 'vencidos' },
    { title: "Pacientes Inativos", value: dashboardData.pacientesInativosBanco, IconComponent: UserMinusIcon, iconColor: "text-slate-500", key: 'inativos' },
  ];

  // Remover as linhas dos cards de métricas financeiras
  // <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-5 md:grid-cols-2 lg:grid-cols-4">
  //   {metricasLinha2.map((item) => (
  //     <CardMetric key={item.title} title={item.title} value={item.value.toString()} IconComponent={item.IconComponent} iconColor={item.iconColor} />
  //   ))}
  // </div>
        return (
    <div className="py-6 px-3 sm:px-6 lg:px-8 bg-slate-50 min-h-screen">
      <div className="max-w-3xl md:max-w-7xl mx-auto space-y-6 md:space-y-8">
        {/* Espaço removido: Boas-vindas */}
        {/* Topo: Placeholder (esquerda) + Próximos Atendimentos (direita) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ErrorBoundary name="Tarefas Rápidas">
            <QuickTasksWidget />
          </ErrorBoundary>
          <ErrorBoundary name="Próximos Atendimentos">
            <CardProximosAtendimentos atendimentos={proximosAtendimentos} />
          </ErrorBoundary>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-5 md:grid-cols-2 lg:grid-cols-4">
          {metricasLinha1.map((item) => (
            <CardMetric
              key={item.title}
              title={item.title}
              value={item.value.toString()}
              IconComponent={item.IconComponent}
              iconColor={item.iconColor}
              onClick={() => {
                if (item.key === 'ativos') {
                  // Abre lista de pacientes filtrando Ativo
                  window.location.href = '/pacientes?status=Ativo';
                } else if (item.key === 'contatar') {
                  // Abre lista de pacientes com status calculado "Contato"
                  window.location.href = '/pacientes?status=Contato';
                } else if (item.key === 'vencidos') {
                  // Abre pacientes filtrando por vencidos (lógica baseada em statusRules)
                  window.location.href = '/pacientes?status=Vencido';
                } else if (item.key === 'inativos') {
                  // Abre pacientes filtrando por inativos (status do banco)
                  window.location.href = '/pacientes?status=Inativo';
                }
              }}
            />
          ))}
        </div>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <ErrorBoundary name="Contato Imediato">
            <WidgetRadarOportunidades procedimentos={oportunidadesQuentes} />
          </ErrorBoundary>
          <ErrorBoundary name="Renovações Atrasadas">
            <WidgetRadarRenovacoes procedimentos={renovacoesAtrasadas} />
          </ErrorBoundary>
          <ErrorBoundary name="Carteira de Procedimentos">
            <WidgetRadarCarteiraAtivos carteira={carteiraAtivos} />
          </ErrorBoundary>
          <ErrorBoundary name="Alerta de Perda">
            <WidgetRadarChurn pacientes={pacientesChurn} />
          </ErrorBoundary>
        </div>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <ErrorBoundary name="Aniversários do Mês">
            <CardAniversarios aniversariantes={dashboardData.aniversariantesDoMes} />
          </ErrorBoundary>
          <ErrorBoundary name="Campanhas Marketing">
            <CampanhasMarketingWidget />
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}