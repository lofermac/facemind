'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../utils/supabaseClient';
import { PiggyBank, Coins, LineChart, Percent, ListChecks, Package, FlaskConical, Building2, Users, Crown, TrendingUp, Target } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, Line, PieChart, Pie, Cell
} from 'recharts';
import { BarProps } from 'recharts';
import AppleLikeLoader from '@/components/AppleLikeLoader';
import FinanceiroCardList from './FinanceiroCardList';

interface ProcedimentoFinanceiro {
  id: string;
  data_procedimento: string | null;
  paciente_nome?: string | null;
  procedimento_nome: string | null;
  categoria_nome: string | null;
  valor_cobrado: number | null;
  custo_produto: number | null;
  custo_insumos: number | null;
  custo_sala: number | null;
}

function formatarData(data: string | null): string {
  if (!data) return '-';
  // Usar UTC consistentemente para evitar problemas de fuso horário
  const date = new Date(data);
  const dia = String(date.getUTCDate()).padStart(2, '0');
  const mes = String(date.getUTCMonth() + 1).padStart(2, '0');
  const ano = date.getUTCFullYear();
  return `${dia}/${mes}/${ano}`;
}

function formatarValor(valor: number | null): string {
  if (valor === null || valor === undefined) return 'R$ -';
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

const mesesNomes = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export default function FinanceiroPage() {
  const [procedimentos, setProcedimentos] = useState<ProcedimentoFinanceiro[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroAno, setFiltroAno] = useState(new Date().getFullYear());
  const [filtroMes, setFiltroMes] = useState(0); // 0 = todos os meses
  const [categorias, setCategorias] = useState<string[]>([]);
  const [anos, setAnos] = useState<number[]>([]);
  const [abaSelecionada, setAbaSelecionada] = useState<'overview' | 'select'>('select');

  useEffect(() => {
    async function fetchProcedimentos() {
      setLoading(true);
      // Buscar procedimentos com nome do paciente e do procedimento corretamente
      const { data, error } = await supabase
        .from('procedimentos_realizados')
        .select(`
          id, 
          data_procedimento, 
          procedimento_tabela_valores_id ( nome_procedimento ), 
          categoria_nome, 
          valor_cobrado, 
          custo_produto, 
          custo_insumos, 
          custo_sala, 
          paciente_id, 
          pacientes (nome)
        `)
        .order('data_procedimento', { ascending: false });
      if (!error && data) {
        // Mapear nome do paciente e procedimento para cada registro
        const procedimentosComPaciente = data.map((p: any) => ({
          ...p,
          paciente_nome: p.pacientes?.nome || '',
          procedimento_nome: p.procedimento_tabela_valores_id?.nome_procedimento || p.procedimento_nome || 'Procedimento não especificado',
          // Garantir que valores financeiros nunca sejam undefined
          valor_cobrado: p.valor_cobrado || 0,
          custo_produto: p.custo_produto || 0,
          custo_insumos: p.custo_insumos || 0,
          custo_sala: p.custo_sala || 0,
        }));
        setProcedimentos(procedimentosComPaciente);
        // Descobrir anos únicos - usar UTC para consistência
        const anosUnicos = Array.from(new Set(
          procedimentosComPaciente
            .map((p: any) => {
              if (!p.data_procedimento) return undefined;
              const ano = new Date(p.data_procedimento).getUTCFullYear();
              return isNaN(ano) ? undefined : ano;
            })
            .filter((v): v is number => typeof v === 'number')
        ));
        setAnos(anosUnicos.sort((a, b) => b - a));
        // Descobrir categorias únicas
        const cats = Array.from(new Set(procedimentosComPaciente.map((p: any) => p.categoria_nome).filter(Boolean)));
        setCategorias(cats);
      }
      setLoading(false);
    }
    fetchProcedimentos();
  }, []);

  // Filtro correto: só traz procedimentos do mês e ano selecionados (ou todos se filtroMes=0)
  const procedimentosFiltrados = procedimentos.filter(p => {
    if (!p.data_procedimento) return false;
    const data = new Date(p.data_procedimento);
    const matchAno = filtroAno ? data.getUTCFullYear() === filtroAno : true;
    const matchMes = filtroMes > 0 ? (data.getUTCMonth() + 1) === filtroMes : true;
    const matchCategoria = filtroCategoria ? p.categoria_nome === filtroCategoria : true;
    return matchAno && matchMes && matchCategoria;
  });

  // Filtros para o gráfico (apenas ano e categoria) - usar UTC consistentemente
  const procedimentosParaGrafico = procedimentos.filter(p => {
    if (!p.data_procedimento) return false;
    const data = new Date(p.data_procedimento);
    const matchAno = filtroAno ? data.getUTCFullYear() === filtroAno : true;
    const matchCategoria = filtroCategoria ? p.categoria_nome === filtroCategoria : true;
    return matchAno && matchCategoria;
  });

  // Cálculos financeiros - garantir que null seja tratado como 0
  const totalFaturado = procedimentosFiltrados.reduce((acc, p) => acc + (p.valor_cobrado ?? 0), 0);
  const totalCustos = procedimentosFiltrados.reduce((acc, p) => {
    return acc + (p.custo_produto ?? 0) + (p.custo_insumos ?? 0) + (p.custo_sala ?? 0);
  }, 0);
  const totalCustoProdutos = procedimentosFiltrados.reduce((acc, p) => acc + (p.custo_produto ?? 0), 0);
  const totalCustoInsumos = procedimentosFiltrados.reduce((acc, p) => acc + (p.custo_insumos ?? 0), 0);
  const totalCustoSala = procedimentosFiltrados.reduce((acc, p) => acc + (p.custo_sala ?? 0), 0);
  const lucroPeriodo = procedimentosFiltrados.reduce((acc, p) => {
    const valor = p.valor_cobrado ?? 0;
    const custo = (p.custo_produto ?? 0) + (p.custo_insumos ?? 0) + (p.custo_sala ?? 0);
    return acc + (valor - custo);
  }, 0);
  // Cálculo do faturamento do mês - respeitar filtros selecionados
  const faturamentoMes = filtroMes > 0 ? totalFaturado : 
    procedimentosFiltrados.filter(p => {
      if (!p.data_procedimento) return false;
      const data = new Date(p.data_procedimento);
      const agora = new Date();
      return data.getUTCMonth() === agora.getUTCMonth() && data.getUTCFullYear() === agora.getUTCFullYear();
    }).reduce((acc, p) => acc + (p.valor_cobrado ?? 0), 0);
  const ticketMedio = procedimentosFiltrados.length > 0 ? totalFaturado / procedimentosFiltrados.length : 0;
  const margemLucro = totalFaturado > 0 ? (lucroPeriodo / totalFaturado) * 100 : 0;

  // Faturamento e Lucro por mês (do ano filtrado, ignorando filtro de mês) - usar UTC consistentemente
  const faturamentoPorMes = Array.from({ length: 12 }, (_, i) => {
    const procedimentosDoMes = procedimentosParaGrafico.filter(p => {
      if (!p.data_procedimento) return false;
      const data = new Date(p.data_procedimento);
      return data.getUTCFullYear() === filtroAno && data.getUTCMonth() === i;
    });
    const total = procedimentosDoMes.reduce((acc, p) => acc + (p.valor_cobrado ?? 0), 0);
    const lucro = procedimentosDoMes.reduce((acc, p) => {
      const valor = p.valor_cobrado ?? 0;
      const custoProduto = p.custo_produto ?? 0;
      const custoSala = p.custo_sala ?? 0;
      const custoInsumos = p.custo_insumos ?? 0;
      return acc + (valor - (custoProduto + custoSala + custoInsumos));
    }, 0);
    return { mes: mesesNomes[i], total, lucro };
  });

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="mb-6 text-center md:text-left">
          <h1 className="text-2xl font-bold text-slate-900">Financeiro</h1>
          <p className="text-slate-600 text-sm mt-1">Visualize e gerencie todos os dados financeiros da clínica</p>
        </div>
        {/* Menu de abas sutil no topo */}
        <div className="flex flex-col gap-6 mb-8 w-full">
          <div className="flex flex-row w-full items-center justify-between gap-6 flex-wrap">
            <div className="flex items-center">
              <div className="flex space-x-2 bg-white/70 backdrop-blur-xl rounded-full p-2 shadow-lg border border-white/30">
            <button
                  className={`px-6 py-2 rounded-full font-semibold text-base transition-all duration-200
                    ${abaSelecionada === 'overview'
                      ? 'bg-gradient-to-r from-blue-400 to-blue-600 text-white shadow-lg scale-105'
                      : 'text-slate-600 hover:text-blue-700 hover:bg-white/80'}
                  `}
                  style={{ boxShadow: abaSelecionada === 'overview' ? '0 2px 16px 0 rgba(30, 64, 175, 0.10)' : undefined }}
              onClick={() => setAbaSelecionada('overview')}
            >
              Overview
            </button>
            <button
                  className={`px-6 py-2 rounded-full font-semibold text-base transition-all duration-200
                    ${abaSelecionada === 'select'
                      ? 'bg-gradient-to-r from-green-400 to-green-600 text-white shadow-lg scale-105'
                      : 'text-slate-600 hover:text-green-700 hover:bg-white/80'}
                  `}
                  style={{ boxShadow: abaSelecionada === 'select' ? '0 2px 16px 0 rgba(22, 163, 74, 0.10)' : undefined }}
                  onClick={() => setAbaSelecionada('select')}
            >
                  Select
            </button>
          </div>
        </div>
            {abaSelecionada === 'select' && (
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 items-stretch sm:items-center justify-end w-full md:w-auto mt-4 md:mt-0">
            <select
                  className="bg-white/70 backdrop-blur-xl border border-white/30 shadow-lg rounded-xl px-5 py-2 h-11 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-base text-slate-700 transition-all duration-200 font-medium w-full sm:w-auto min-w-[110px]"
              value={filtroAno}
              onChange={e => setFiltroAno(Number(e.target.value))}
            >
              {anos.map(ano => (
                <option key={ano} value={ano}>{ano}</option>
              ))}
            </select>
            <select
                  className="bg-white/70 backdrop-blur-xl border border-white/30 shadow-lg rounded-xl px-5 py-2 h-11 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-base text-slate-700 transition-all duration-200 font-medium w-full sm:w-auto min-w-[160px]"
              value={filtroMes}
              onChange={e => setFiltroMes(Number(e.target.value))}
            >
              <option value={0}>Todos os Meses</option>
              {mesesNomes.map((mes, idx) => (
                <option key={mes} value={idx + 1}>{mes}</option>
              ))}
            </select>
            <select
                  className="bg-white/70 backdrop-blur-xl border border-white/30 shadow-lg rounded-xl px-5 py-2 h-11 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-base text-slate-700 transition-all duration-200 font-medium w-full sm:w-auto min-w-[180px]"
              value={filtroCategoria}
              onChange={e => setFiltroCategoria(e.target.value)}
            >
              <option value="">Todas as Categorias</option>
              {categorias.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        )}
          </div>
        </div>
        {abaSelecionada === 'select' && (
          <>
            {/* Primeira linha: Faturamento, Custos, Lucro, Margem de Lucro */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-4 mb-6">
              <div className="bg-white/60 backdrop-blur-xl shadow-lg rounded-2xl p-5 md:p-8 flex flex-col items-center justify-center text-center border border-white/30">
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white/40 backdrop-blur-md shadow mb-3">
                  <PiggyBank className="w-7 h-7 text-green-500" />
                </div>
                <div className="text-slate-600 text-base font-semibold">Faturamento</div>
                <div className="text-2xl font-bold text-slate-900 mt-1">{formatarValor(totalFaturado)}</div>
              </div>
              <div className="bg-white/60 backdrop-blur-xl shadow-lg rounded-2xl p-5 md:p-8 flex flex-col items-center justify-center text-center border border-white/30">
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white/40 backdrop-blur-md shadow mb-3">
                  <Coins className="w-7 h-7 text-red-500" />
                </div>
                <div className="text-slate-600 text-base font-semibold">Custos</div>
                <div className="text-2xl font-bold text-slate-900 mt-1">{formatarValor(totalCustos)}</div>
              </div>
              <div className="bg-white/60 backdrop-blur-xl shadow-lg rounded-2xl p-5 md:p-8 flex flex-col items-center justify-center text-center border border-white/30">
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white/40 backdrop-blur-md shadow mb-3">
                  <LineChart className="w-7 h-7 text-blue-500" />
                </div>
                <div className="text-slate-600 text-base font-semibold">Lucro</div>
                <div className="text-2xl font-bold text-slate-900 mt-1">{formatarValor(lucroPeriodo)}</div>
              </div>
              <div className="bg-white/60 backdrop-blur-xl shadow-lg rounded-2xl p-5 md:p-8 flex flex-col items-center justify-center text-center border border-white/30">
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white/40 backdrop-blur-md shadow mb-3">
                  <Percent className="w-7 h-7 text-yellow-500" />
                </div>
                <div className="text-slate-600 text-base font-semibold">Margem de Lucro</div>
                <div className="text-2xl font-bold text-slate-900 mt-1">{margemLucro.toFixed(1)}%</div>
              </div>
            </div>
            {/* Segunda linha: Procedimentos, Custo com Produtos, Custo com Insumos, Custo com Sala */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-4 mb-6">
              <div className="bg-white/60 backdrop-blur-xl shadow-lg rounded-2xl p-5 md:p-8 flex flex-col items-center justify-center text-center border border-white/30">
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white/40 backdrop-blur-md shadow mb-3">
                  <ListChecks className="w-7 h-7 text-purple-500" />
                </div>
                <div className="text-slate-600 text-base font-semibold">Procedimentos</div>
                <div className="text-2xl font-bold text-slate-900 mt-1">{procedimentosFiltrados.length}</div>
                <div className="text-slate-400 text-xs mt-1">Ticket Médio: {formatarValor(ticketMedio)}</div>
              </div>
              <div className="bg-white/60 backdrop-blur-xl shadow-lg rounded-2xl p-5 md:p-8 flex flex-col items-center justify-center text-center border border-white/30">
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white/40 backdrop-blur-md shadow mb-3">
                  <Package className="w-7 h-7 text-red-500" />
                </div>
                <div className="text-slate-600 text-base font-semibold">Custo com Produtos</div>
                <div className="text-2xl font-bold text-slate-900 mt-1">{formatarValor(totalCustoProdutos)}</div>
              </div>
              <div className="bg-white/60 backdrop-blur-xl shadow-lg rounded-2xl p-5 md:p-8 flex flex-col items-center justify-center text-center border border-white/30">
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white/40 backdrop-blur-md shadow mb-3">
                  <FlaskConical className="w-7 h-7 text-yellow-500" />
                </div>
                <div className="text-slate-600 text-base font-semibold">Custo com Insumos</div>
                <div className="text-2xl font-bold text-slate-900 mt-1">{formatarValor(totalCustoInsumos)}</div>
              </div>
              <div className="bg-white/60 backdrop-blur-xl shadow-lg rounded-2xl p-5 md:p-8 flex flex-col items-center justify-center text-center border border-white/30">
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white/40 backdrop-blur-md shadow mb-3">
                  <Building2 className="w-7 h-7 text-blue-500" />
                </div>
                <div className="text-slate-600 text-base font-semibold">Custo com Sala</div>
                <div className="text-2xl font-bold text-slate-900 mt-1">{formatarValor(totalCustoSala)}</div>
              </div>
            </div>
          </>
        )}
        {abaSelecionada === 'overview' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Gráfico de Faturamento */}
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-100">
                <h2 className="text-2xl font-bold text-blue-700 mb-4 flex items-center gap-2">
                  <PiggyBank className="w-7 h-7 text-blue-400" /> Faturamento Mensal <span className="text-base font-normal text-gray-400">({filtroAno})</span>
                </h2>
                <div className="w-full h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={faturamentoPorMes} margin={{ top: 20, right: 30, left: 0, bottom: 0 }} barCategoryGap={14} barSize={26}>
                      <defs>
                        <linearGradient id="faturamentoGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#60a5fa" stopOpacity={0.9} />
                          <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.7} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="4 4" stroke="#e0e7ef" />
                      <XAxis dataKey="mes" tick={{ fontSize: 15, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <YAxis tickFormatter={v => `R$ ${v / 1000 >= 1 ? (v / 1000).toFixed(1) + 'k' : v}`}
                        tick={{ fontSize: 14, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <Tooltip
                        cursor={{ fill: 'rgba(59,130,246,0.08)' }}
                        contentStyle={{ background: '#fff', borderRadius: 12, border: '1px solid #e0e7ef', fontSize: 15, boxShadow: '0 4px 24px 0 rgba(59,130,246,0.08)' }}
                        formatter={value => formatarValor(Number(value))}
                      />
                      <Bar dataKey="total" name="Faturamento" radius={[12, 12, 8, 8]} fill="url(#faturamentoGradient)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              {/* Gráfico de Lucro */}
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-100">
                <h2 className="text-2xl font-bold text-green-700 mb-4 flex items-center gap-2">
                  <LineChart className="w-7 h-7 text-green-400" /> Lucro Mensal <span className="text-base font-normal text-gray-400">({filtroAno})</span>
                </h2>
                <div className="w-full h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={faturamentoPorMes} margin={{ top: 20, right: 30, left: 0, bottom: 0 }} barCategoryGap={14} barSize={26}>
                      <defs>
                        <linearGradient id="lucroGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#4ade80" stopOpacity={0.9} />
                          <stop offset="100%" stopColor="#16a34a" stopOpacity={0.7} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="4 4" stroke="#e0e7ef" />
                      <XAxis dataKey="mes" tick={{ fontSize: 15, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <YAxis tickFormatter={v => `R$ ${v / 1000 >= 1 ? (v / 1000).toFixed(1) + 'k' : v}`}
                        tick={{ fontSize: 14, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <Tooltip
                        cursor={{ fill: 'rgba(34,197,94,0.08)' }}
                        contentStyle={{ background: '#fff', borderRadius: 12, border: '1px solid #e0e7ef', fontSize: 15, boxShadow: '0 4px 24px 0 rgba(34,197,94,0.08)' }}
                        formatter={value => formatarValor(Number(value))}
                      />
                      <Bar dataKey="lucro" name="Lucro" radius={[12, 12, 8, 8]} fill="url(#lucroGradient)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* NOVOS WIDGETS INTELIGENTES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* Widget 1: Top Categorias por Faturamento */}
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-100">
                <h2 className="text-2xl font-bold text-purple-700 mb-6 flex items-center gap-2">
                  <Crown className="w-7 h-7 text-purple-400" /> Top Categorias <span className="text-base font-normal text-gray-400">({filtroAno})</span>
                </h2>
                <div className="space-y-4">
                  {(() => {
                    // Calcular top categorias por faturamento - CORRIGIDO
                    const topCategorias = procedimentosParaGrafico
                      .filter(p => (p.valor_cobrado ?? 0) > 0) // Só procedimentos com valor
                      .reduce((acc, p) => {
                        // Pegar nome da categoria
                        const categoria = p.categoria_nome || 'Sem Categoria';
                        
                        if (categoria && categoria !== 'Sem Categoria') {
                          acc[categoria] = (acc[categoria] || 0) + (p.valor_cobrado ?? 0);
                        }
                        return acc;
                      }, {} as Record<string, number>);
                    
                    const entries = Object.entries(topCategorias)
                      .filter(([nome, valor]) => valor > 0 && nome !== 'Sem Categoria')
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 5);

                    if (entries.length === 0) {
                      return (
                        <div className="text-center py-8 text-slate-500">
                          <p className="text-sm">Nenhuma categoria encontrada para {filtroAno}</p>
                        </div>
                      );
                    }
                    
                    const maxValor = entries[0][1]; // Maior valor já está primeiro após sort
                    
                    return entries.map(([nome, valor], index) => {
                      const cores = ['bg-purple-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500'];
                      const porcentagem = maxValor > 0 ? (valor / maxValor) * 100 : 0;
                      
                      return (
                        <div key={nome} className="flex items-center gap-4">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-bold text-sm">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-semibold text-slate-700 text-sm" title={nome}>
                                {nome}
                              </span>
                              <span className="font-bold text-purple-600">{formatarValor(valor)}</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${cores[index]} transition-all duration-500`}
                                style={{ width: `${porcentagem}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Widget 2: Distribuição por Categoria */}
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-100">
                <h2 className="text-2xl font-bold text-orange-700 mb-6 flex items-center gap-2">
                  <Target className="w-7 h-7 text-orange-400" /> Distribuição por Categoria <span className="text-base font-normal text-gray-400">({filtroAno})</span>
                </h2>
                <div className="w-full h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={(() => {
                          const categorias = procedimentosParaGrafico
                            .filter(p => (p.valor_cobrado ?? 0) > 0) // Só procedimentos com valor
                            .reduce((acc, p) => {
                              const cat = p.categoria_nome || 'Sem Categoria';
                              if (cat && cat !== 'Sem Categoria') {
                                acc[cat] = (acc[cat] || 0) + (p.valor_cobrado ?? 0);
                              }
                              return acc;
                            }, {} as Record<string, number>);
                          
                          const cores = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#ec4899', '#14b8a6'];
                          
                          const dados = Object.entries(categorias)
                            .filter(([nome, valor]) => valor > 0 && nome !== 'Sem Categoria')
                            .map(([nome, valor], index) => ({
                              name: nome,
                              value: valor,
                              fill: cores[index % cores.length]
                            }))
                            .sort((a, b) => b.value - a.value);

                          // Se não há dados, retornar dados de placeholder
                          if (dados.length === 0) {
                            return [{
                              name: 'Nenhum dado',
                              value: 1,
                              fill: '#e2e8f0'
                            }];
                          }

                          return dados;
                        })()}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                      </Pie>
                      <Tooltip 
                        formatter={(value, name, props) => {
                          const totalValue = procedimentosParaGrafico
                            .filter(p => (p.valor_cobrado ?? 0) > 0)
                            .reduce((acc, p) => acc + (p.valor_cobrado ?? 0), 0);
                          const percentage = totalValue > 0 ? ((Number(value) / totalValue) * 100).toFixed(1) : '0.0';
                          return [`${formatarValor(Number(value))} (${percentage}%)`, name];
                        }}
                        contentStyle={{ 
                          background: '#fff', 
                          borderRadius: 12, 
                          border: '1px solid #e0e7ef', 
                          fontSize: 14,
                          boxShadow: '0 4px 24px 0 rgba(0,0,0,0.1)' 
                        }}
                      />
                      <Legend 
                        verticalAlign="bottom" 
                        height={36}
                        wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Segunda linha de novos widgets */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* Widget 3: Análise de Crescimento */}
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-100">
                <h2 className="text-2xl font-bold text-emerald-700 mb-6 flex items-center gap-2">
                  <TrendingUp className="w-7 h-7 text-emerald-400" /> Análise de Crescimento <span className="text-base font-normal text-gray-400">({filtroAno})</span>
                </h2>
                <div className="space-y-6">
                  {(() => {
                    // Comparar com ano anterior - CORRIGIDO
                    const anoAnterior = filtroAno - 1;
                    
                    // Filtrar procedimentos com valores válidos para análise precisa - usar UTC
                    const procedimentosAtuaisValidos = procedimentosParaGrafico.filter(p => 
                      (p.valor_cobrado ?? 0) > 0 && p.data_procedimento
                    );
                    
                    const procedimentosAnoAnterior = procedimentos.filter(p => {
                      if (!p.data_procedimento || (p.valor_cobrado ?? 0) <= 0) return false;
                      const ano = new Date(p.data_procedimento).getUTCFullYear();
                      return ano === anoAnterior;
                    });
                    
                    const faturamentoAtual = procedimentosAtuaisValidos.reduce((acc, p) => acc + (p.valor_cobrado ?? 0), 0);
                    const faturamentoAnterior = procedimentosAnoAnterior.reduce((acc, p) => acc + (p.valor_cobrado ?? 0), 0);
                    
                    const crescimentoFaturamento = faturamentoAnterior > 0 
                      ? ((faturamentoAtual - faturamentoAnterior) / faturamentoAnterior) * 100 
                      : (faturamentoAtual > 0 ? 100 : 0); // Se não havia faturamento anterior mas há atual = 100% crescimento
                      
                    const procedimentosAtual = procedimentosAtuaisValidos.length;
                    const procedimentosAnterior = procedimentosAnoAnterior.length;
                    
                    const crescimentoProcedimentos = procedimentosAnterior > 0 
                      ? ((procedimentosAtual - procedimentosAnterior) / procedimentosAnterior) * 100 
                      : (procedimentosAtual > 0 ? 100 : 0);

                    const ticketMedioAtual = procedimentosAtual > 0 ? faturamentoAtual / procedimentosAtual : 0;
                    const ticketMedioAnterior = procedimentosAnterior > 0 ? faturamentoAnterior / procedimentosAnterior : 0;
                    
                    const crescimentoTicketMedio = ticketMedioAnterior > 0 
                      ? ((ticketMedioAtual - ticketMedioAnterior) / ticketMedioAnterior) * 100 
                      : (ticketMedioAtual > 0 ? 100 : 0);

                    // Análises avançadas para insights estratégicos
                    const diferencaFaturamento = faturamentoAtual - faturamentoAnterior;
                    const diferencaTicketMedio = ticketMedioAtual - ticketMedioAnterior;
                    
                    // Análise de momentum (últimos vs primeiros meses do ano)
                    const faturamentoPorMesAtual = Array.from({length: 12}, () => 0);
                    procedimentosAtuaisValidos.forEach(p => {
                      if (p.data_procedimento) {
                        const mes = new Date(p.data_procedimento).getUTCMonth();
                        faturamentoPorMesAtual[mes] += p.valor_cobrado ?? 0;
                      }
                    });
                    
                    const mesesComDados = faturamentoPorMesAtual.filter(valor => valor > 0).length;
                    const primeiros3Meses = faturamentoPorMesAtual.slice(0, 3).reduce((acc, val) => acc + val, 0);
                    const ultimos3Meses = faturamentoPorMesAtual.slice(-3).reduce((acc, val) => acc + val, 0);
                    const momentum = mesesComDados >= 6 ? (
                      ultimos3Meses > primeiros3Meses ? 'Acelerando' : 
                      ultimos3Meses < primeiros3Meses ? 'Desacelerando' : 'Estável'
                    ) : 'Insuficiente';
                    
                    // Análise estratégica baseada nos crescimentos
                    const estrategia = crescimentoFaturamento > 0 && crescimentoProcedimentos > 0 ? 'Expansão Saudável' :
                                     crescimentoFaturamento > 0 && crescimentoProcedimentos <= 0 ? 'Valorização Premium' :
                                     crescimentoFaturamento <= 0 && crescimentoProcedimentos > 0 ? 'Pressão de Preços' :
                                     'Necessita Atenção';
                    
                    const corEstrategia = estrategia === 'Expansão Saudável' ? 'text-emerald-600' :
                                        estrategia === 'Valorização Premium' ? 'text-purple-600' :
                                        estrategia === 'Pressão de Preços' ? 'text-orange-600' : 'text-red-600';

                    return (
                      <>
                        {/* Métricas principais com insights */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <p className="text-sm font-medium text-emerald-700 mb-3">Crescimento de Faturamento</p>
                                  <div className="bg-white/80 rounded-xl px-4 py-3 border border-emerald-300/60 shadow-sm w-64">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-sm font-bold text-emerald-900">{filtroAno}</span>
                                      <span className="text-sm font-semibold text-emerald-800">
                                        {formatarValor(faturamentoAtual)}
                                      </span>
                                    </div>
                                    <div className="h-px bg-gradient-to-r from-emerald-200 via-emerald-300 to-emerald-200 my-2"></div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm font-medium text-slate-600">{anoAnterior}</span>
                                      <span className="text-sm text-slate-500">
                                        {formatarValor(faturamentoAnterior)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className={`text-2xl font-bold ${crescimentoFaturamento >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                    {crescimentoFaturamento >= 0 ? '+' : ''}{crescimentoFaturamento.toFixed(1)}%
                                  </div>
                                  <div className={`text-xs font-semibold ${diferencaFaturamento >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                    {diferencaFaturamento >= 0 ? '+' : ''}{formatarValor(Math.abs(diferencaFaturamento))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <p className="text-sm font-medium text-blue-700 mb-3">Crescimento de Volume</p>
                                  <div className="bg-white/80 rounded-xl px-4 py-3 border border-blue-300/60 shadow-sm w-64">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-sm font-bold text-blue-900">{filtroAno}</span>
                                      <span className="text-sm font-semibold text-blue-800">
                                        {procedimentosAtual} procedimentos
                                      </span>
                                    </div>
                                    <div className="h-px bg-gradient-to-r from-blue-200 via-blue-300 to-blue-200 my-2"></div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm font-medium text-slate-600">{anoAnterior}</span>
                                      <span className="text-sm text-slate-500">
                                        {procedimentosAnterior} procedimentos
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className={`text-2xl font-bold ${crescimentoProcedimentos >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                    {crescimentoProcedimentos >= 0 ? '+' : ''}{crescimentoProcedimentos.toFixed(1)}%
                                  </div>
                                  <div className={`text-xs font-semibold ${(procedimentosAtual - procedimentosAnterior) >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                    {(procedimentosAtual - procedimentosAnterior) >= 0 ? '+' : ''}{procedimentosAtual - procedimentosAnterior} procs
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <p className="text-sm font-medium text-purple-700 mb-3">Crescimento de Ticket Médio</p>
                                  <div className="bg-white/80 rounded-xl px-4 py-3 border border-purple-300/60 shadow-sm w-64">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-sm font-bold text-purple-900">{filtroAno}</span>
                                      <span className="text-sm font-semibold text-purple-800">
                                        {formatarValor(ticketMedioAtual)}
                                      </span>
                                    </div>
                                    <div className="h-px bg-gradient-to-r from-purple-200 via-purple-300 to-purple-200 my-2"></div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm font-medium text-slate-600">{anoAnterior}</span>
                                      <span className="text-sm text-slate-500">
                                        {formatarValor(ticketMedioAnterior)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className={`text-2xl font-bold ${crescimentoTicketMedio >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                                    {crescimentoTicketMedio >= 0 ? '+' : ''}{crescimentoTicketMedio.toFixed(1)}%
                                  </div>
                                  <div className={`text-xs font-semibold ${diferencaTicketMedio >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                                    {diferencaTicketMedio >= 0 ? '+' : ''}{formatarValor(Math.abs(diferencaTicketMedio))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Insights estratégicos */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                          <div className="p-4 bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl border border-slate-200">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm font-medium text-slate-700">Momentum do Ano</p>
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                momentum === 'Acelerando' ? 'bg-green-100 text-green-700' :
                                momentum === 'Desacelerando' ? 'bg-orange-100 text-orange-700' :
                                momentum === 'Estável' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                              }`}>
                                {momentum}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600">
                              {momentum === 'Acelerando' ? 'Últimos 3 meses superiores aos primeiros' :
                               momentum === 'Desacelerando' ? 'Últimos 3 meses inferiores aos primeiros' :
                               momentum === 'Estável' ? 'Performance consistente ao longo do ano' :
                               'Dados insuficientes para análise de tendência'}
                            </p>
                          </div>

                          <div className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-200">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm font-medium text-slate-700">Estratégia Sugerida</p>
                              <span className={`text-sm font-bold ${corEstrategia}`}>
                                {estrategia}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600">
                              {estrategia === 'Expansão Saudável' ? 'Crescimento equilibrado. Continue expandindo.' :
                               estrategia === 'Valorização Premium' ? 'Foco em aumentar valor dos serviços funcionando.' :
                               estrategia === 'Pressão de Preços' ? 'Revisar precificação e posicionamento.' :
                               'Análise detalhada necessária para reversão.'}
                            </p>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Widget 4: Performance Mensal */}
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-100">
                <h2 className="text-2xl font-bold text-slate-700 mb-6 flex items-center gap-2">
                  <Users className="w-7 h-7 text-slate-400" /> Performance Mensal <span className="text-base font-normal text-gray-400">({filtroAno})</span>
                </h2>
                <div className="space-y-4">
                  {(() => {
                    // Análise do melhor e pior mês - CORRIGIDO
                    const mesesComFaturamento = faturamentoPorMes.filter(mes => mes.total > 0);
                    
                    if (mesesComFaturamento.length === 0) {
                      return (
                        <div className="text-center py-8 text-slate-500">
                          <p className="text-sm">Nenhum faturamento encontrado para {filtroAno}</p>
                        </div>
                      );
                    }
                    
                    const melhorMes = mesesComFaturamento.reduce((max, mes) => 
                      mes.total > max.total ? mes : max
                    );
                    
                    const piorMes = mesesComFaturamento.reduce((min, mes) => 
                      mes.total < min.total ? mes : min
                    );

                    const totalFaturamentoAno = faturamentoPorMes.reduce((acc, mes) => acc + mes.total, 0);
                    const mediaFaturamento = totalFaturamentoAno / 12;
                    const mediaProcedimentos = procedimentosParaGrafico.filter(p => (p.valor_cobrado ?? 0) > 0).length / 12;
                    const mesesAtivos = mesesComFaturamento.length;

                    // Análises avançadas para insights mensais
                    const diferenca = melhorMes.total - piorMes.total;
                    const variabilidade = mesesComFaturamento.length > 1 ? (diferenca / piorMes.total) * 100 : 0;
                    
                    // Análise de consistência (coeficiente de variação)
                    const valores = mesesComFaturamento.map(m => m.total);
                    const media = valores.reduce((a, b) => a + b, 0) / valores.length;
                    const variancia = valores.reduce((acc, val) => acc + Math.pow(val - media, 2), 0) / valores.length;
                    const desvioPadrao = Math.sqrt(variancia);
                    const coeficienteVariacao = media > 0 ? (desvioPadrao / media) * 100 : 0;
                    const consistencia = coeficienteVariacao < 25 ? 'Alta' : coeficienteVariacao < 50 ? 'Média' : 'Baixa';
                    
                    // Análise de tendência (primeira vs segunda metade)
                    const metade = Math.floor(mesesComFaturamento.length / 2);
                    const primeiraMetade = mesesComFaturamento.slice(0, metade);
                    const segundaMetade = mesesComFaturamento.slice(metade);
                    
                    const mediaPrimeira = primeiraMetade.length > 0 ? primeiraMetade.reduce((acc, mes) => acc + mes.total, 0) / primeiraMetade.length : 0;
                    const mediaSegunda = segundaMetade.length > 0 ? segundaMetade.reduce((acc, mes) => acc + mes.total, 0) / segundaMetade.length : 0;
                    const tendencia = mesesComFaturamento.length >= 4 ? (
                      mediaSegunda > mediaPrimeira ? 'Crescente' : 
                      mediaSegunda < mediaPrimeira ? 'Decrescente' : 'Estável'
                    ) : 'Insuficiente';
                    
                    // Análise de sazonalidade (trimestres)
                    const trimestres = [
                      { nome: '1º Tri', meses: [0,1,2], valor: 0 },
                      { nome: '2º Tri', meses: [3,4,5], valor: 0 },
                      { nome: '3º Tri', meses: [6,7,8], valor: 0 },
                      { nome: '4º Tri', meses: [9,10,11], valor: 0 }
                    ];
                    
                    trimestres.forEach(t => {
                      t.valor = t.meses.reduce((acc, mes) => acc + (faturamentoPorMes[mes]?.total || 0), 0);
                    });
                    
                    const melhorTrimestre = trimestres.reduce((max, tri) => tri.valor > max.valor ? tri : max);
                    const participacaoMelhorTri = totalFaturamentoAno > 0 ? (melhorTrimestre.valor / totalFaturamentoAno) * 100 : 0;

                    return (
                      <>
                        {/* Performance principal com insights */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-xs font-medium text-green-700">Melhor Mês</p>
                              <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                {((melhorMes.total / totalFaturamentoAno) * 100).toFixed(1)}%
                              </span>
                            </div>
                            <p className="text-lg font-bold text-green-600">{melhorMes.mes}</p>
                            <p className="text-sm text-green-600">{formatarValor(melhorMes.total)}</p>
                          </div>
                          
                          <div className="p-4 bg-gradient-to-br from-red-50 to-pink-50 rounded-xl border border-red-200">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-xs font-medium text-red-700">{mesesComFaturamento.length > 1 ? 'Pior Mês' : 'Único Mês'}</p>
                              {mesesComFaturamento.length > 1 && (
                                <span className="text-xs font-semibold text-red-600 bg-red-100 px-2 py-1 rounded-full">
                                  -{variabilidade.toFixed(0)}%
                                </span>
                              )}
                            </div>
                            <p className="text-lg font-bold text-red-600">{piorMes.mes}</p>
                            <p className="text-sm text-red-600">{formatarValor(piorMes.total)}</p>
                          </div>
                        </div>

                        {/* Insights analíticos */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                          <div className={`p-3 rounded-xl border ${
                            tendencia === 'Crescente' ? 'border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50' :
                            tendencia === 'Decrescente' ? 'border-orange-200 bg-gradient-to-r from-orange-50 to-red-50' :
                            tendencia === 'Estável' ? 'border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50' :
                            'border-slate-200 bg-gradient-to-r from-slate-50 to-gray-50'
                          }`}>
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-xs font-medium text-slate-700">Tendência</p>
                              <span className={`text-xs font-bold ${
                                tendencia === 'Crescente' ? 'text-emerald-600' :
                                tendencia === 'Decrescente' ? 'text-orange-600' :
                                tendencia === 'Estável' ? 'text-blue-600' : 'text-slate-600'
                              }`}>
                                {tendencia}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600">
                              {tendencia === 'Crescente' ? '2ª metade > 1ª metade' :
                               tendencia === 'Decrescente' ? '2ª metade < 1ª metade' :
                               tendencia === 'Estável' ? 'Performance equilibrada' :
                               'Poucos dados para análise'}
                            </p>
                          </div>

                          <div className={`p-3 rounded-xl border ${
                            consistencia === 'Alta' ? 'border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50' :
                            consistencia === 'Média' ? 'border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50' :
                            'border-red-200 bg-gradient-to-r from-red-50 to-pink-50'
                          }`}>
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-xs font-medium text-slate-700">Consistência</p>
                              <span className={`text-xs font-bold ${
                                consistencia === 'Alta' ? 'text-blue-600' :
                                consistencia === 'Média' ? 'text-yellow-600' : 'text-red-600'
                              }`}>
                                {consistencia}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600">
                              CV: {coeficienteVariacao.toFixed(1)}%
                            </p>
                          </div>

                          <div className="p-3 rounded-xl border border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-xs font-medium text-slate-700">Melhor Período</p>
                              <span className="text-xs font-bold text-purple-600">
                                {participacaoMelhorTri.toFixed(1)}%
                              </span>
                            </div>
                            <p className="text-xs text-purple-600 font-semibold">
                              {melhorTrimestre.nome} • {formatarValor(melhorTrimestre.valor)}
                            </p>
                          </div>
                        </div>

                        {/* Métricas consolidadas */}
                        <div className="space-y-3">
                          <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                            <span className="text-sm font-medium text-slate-700">Faturamento Médio/Mês</span>
                            <div className="text-right">
                              <span className="font-bold text-slate-900 block">{formatarValor(mediaFaturamento)}</span>
                              <span className="text-xs text-slate-500">
                                {((mediaFaturamento / totalFaturamentoAno) * 100 * 12).toFixed(1)}% ideal
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                            <span className="text-sm font-medium text-slate-700">Procedimentos Médio/Mês</span>
                            <div className="text-right">
                              <span className="font-bold text-slate-900 block">{mediaProcedimentos.toFixed(1)}</span>
                              <span className="text-xs text-slate-500">
                                Ticket médio: {formatarValor(mediaProcedimentos > 0 ? mediaFaturamento / mediaProcedimentos : 0)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                            <span className="text-sm font-medium text-slate-700">Meses Ativos</span>
                            <div className="text-right">
                              <span className="font-bold text-slate-900 block">{mesesAtivos}/12</span>
                              <span className="text-xs text-slate-500">
                                {((mesesAtivos / 12) * 100).toFixed(0)}% do ano
                              </span>
                            </div>
                          </div>

                          <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                            <span className="text-sm font-medium text-emerald-700">Total do Ano</span>
                            <div className="text-right">
                              <span className="font-bold text-emerald-600 block">{formatarValor(totalFaturamentoAno)}</span>
                              <span className="text-xs text-emerald-500">
                                {mesesAtivos > 0 ? `${(totalFaturamentoAno / mesesAtivos * 12 / totalFaturamentoAno * 100).toFixed(0)}% potencial anualizado` : ''}
                              </span>
                            </div>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          </>
        )}
        {/* Tabela de Procedimentos: só aparece na aba Smart */}
        {abaSelecionada === 'select' && (
          <div className="bg-white/60 backdrop-blur-2xl shadow-2xl rounded-3xl p-4 sm:p-8 border border-white/20 mt-6" style={{background: 'linear-gradient(135deg, rgba(255,255,255,0.75) 60%, rgba(236,245,255,0.7) 100%)'}}>
            <h2 className="text-2xl font-bold text-blue-700 mb-6 flex items-center gap-2 drop-shadow-sm">
              <ListChecks className="w-7 h-7 text-blue-400" /> Procedimentos
            </h2>
            {/* Lista mobile */}
            <FinanceiroCardList procedimentos={procedimentosFiltrados.slice(0, 50).map(p=>({
              ...p,
              paciente_nome: p.paciente_nome || '-',
            }))} />

            {/* Tabela desktop */}
            <div className="relative overflow-x-auto scroll-x-indicator hidden md:block">
              <table className="min-w-full text-center rounded-3xl overflow-hidden">
                <thead className="bg-white/90 backdrop-blur-xl shadow-sm">
                  <tr>
                    <th className="px-7 py-4 text-xs font-semibold text-slate-700 uppercase tracking-wider text-left rounded-tl-2xl shadow-sm">Data</th>
                    <th className="px-7 py-4 text-xs font-semibold text-slate-700 uppercase tracking-wider text-left">Paciente</th>
                    <th className="px-7 py-4 text-xs font-semibold text-slate-700 uppercase tracking-wider text-left">Categoria</th>
                    <th className="px-7 py-4 text-xs font-semibold text-slate-700 uppercase tracking-wider text-left">Procedimento</th>
                    <th className="px-7 py-4 text-xs font-semibold text-slate-700 uppercase tracking-wider text-left rounded-tr-2xl shadow-sm">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={5} className="py-12"><div className="flex justify-center"><AppleLikeLoader /></div></td></tr>
                  ) : procedimentosFiltrados.slice(0, 10).map((proc, idx, arr) => (
                    <Link key={proc.id} href={`/procedimentos/editar/${proc.id}`} legacyBehavior>
                      <tr
                        className={`transition-all duration-200 group cursor-pointer ${idx === arr.length - 1 ? '' : 'border-b border-white/20'} hover:shadow-lg hover:-translate-y-0.5 hover:bg-white/80 hover:backdrop-blur-2xl`}
                        style={{ transitionProperty: 'box-shadow, background, transform' }}
                      >
                        <td className="px-7 py-4 whitespace-nowrap font-semibold text-slate-700 group-hover:text-blue-700 transition-colors duration-150 text-left rounded-l-2xl">
                          {formatarData(proc.data_procedimento)}
                        </td>
                        <td className="px-7 py-4 whitespace-nowrap text-slate-700 text-left">
                          {proc.paciente_nome}
                        </td>
                        <td className="px-7 py-4 whitespace-nowrap text-slate-500 text-left">
                          {proc.categoria_nome}
                        </td>
                        <td className="px-7 py-4 whitespace-nowrap font-semibold text-slate-700 text-left">
                          {proc.procedimento_nome}
                        </td>
                        <td className="px-7 py-4 whitespace-nowrap font-bold text-green-600 text-left drop-shadow-sm rounded-r-2xl">
                          <span className="inline-block bg-green-50/80 text-green-700 px-3 py-1 rounded-xl font-semibold shadow-sm text-base">
                            {formatarValor(proc.valor_cobrado)}
                          </span>
                        </td>
                    </tr>
                    </Link>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 