'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../utils/supabaseClient';
import { PiggyBank, Coins, LineChart, Percent, ListChecks, Package, FlaskConical, Building2 } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, Line
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
  custo_produto?: number | null;
  custo_insumos?: number | null;
  custo_sala?: number | null;
}

function formatarData(data: string | null): string {
  if (!data) return '-';
  return new Date(data).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
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
      // Buscar procedimentos com nome do paciente
      const { data, error } = await supabase
        .from('procedimentos_realizados')
        .select('id, data_procedimento, procedimento_tabela_valores_id ( nome_procedimento ), categoria_nome, valor_cobrado, custo_produto, custo_insumos, custo_sala, paciente_id, pacientes (nome)')
        .order('data_procedimento', { ascending: false });
      if (!error && data) {
        // Mapear nome do paciente para cada procedimento
        const procedimentosComPaciente = data.map((p: any) => ({
          ...p,
          paciente_nome: p.pacientes?.nome || '',
        }));
        setProcedimentos(procedimentosComPaciente);
        // Descobrir anos únicos
        const anosUnicos = Array.from(new Set(
          procedimentosComPaciente
            .map((p: any) => {
              if (!p.data_procedimento) return undefined;
              const ano = new Date(p.data_procedimento).getFullYear();
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

  // Filtros para o gráfico (apenas ano e categoria)
  const procedimentosParaGrafico = procedimentos.filter(p => {
    if (!p.data_procedimento) return false;
    const data = new Date(p.data_procedimento);
    const matchAno = filtroAno ? data.getFullYear() === filtroAno : true;
    const matchCategoria = filtroCategoria ? p.categoria_nome === filtroCategoria : true;
    return matchAno && matchCategoria;
  });

  // Cálculos financeiros
  const totalFaturado = procedimentosFiltrados.reduce((acc, p) => acc + (p.valor_cobrado || 0), 0);
  const totalCustos = procedimentosFiltrados.reduce((acc, p) => {
    return acc + (p.custo_produto || 0) + (p.custo_insumos || 0) + (p.custo_sala || 0);
  }, 0);
  const totalCustoProdutos = procedimentosFiltrados.reduce((acc, p) => acc + (p.custo_produto || 0), 0);
  const totalCustoInsumos = procedimentosFiltrados.reduce((acc, p) => acc + (p.custo_insumos || 0), 0);
  const totalCustoSala = procedimentosFiltrados.reduce((acc, p) => acc + (p.custo_sala || 0), 0);
  const lucroPeriodo = procedimentosFiltrados.reduce((acc, p) => {
    const valor = p.valor_cobrado || 0;
    const custo = (p.custo_produto || 0) + (p.custo_insumos || 0) + (p.custo_sala || 0);
    return acc + (valor - custo);
  }, 0);
  const procedimentosDoMes = procedimentosFiltrados.filter(p => {
    if (!p.data_procedimento) return false;
    const data = new Date(p.data_procedimento);
    const agora = new Date();
    return data.getMonth() === agora.getMonth() && data.getFullYear() === agora.getFullYear();
  });
  const faturamentoMes = procedimentosDoMes.reduce((acc, p) => acc + (p.valor_cobrado || 0), 0);
  const ticketMedio = procedimentosFiltrados.length > 0 ? totalFaturado / procedimentosFiltrados.length : 0;
  const margemLucro = totalFaturado > 0 ? (lucroPeriodo / totalFaturado) * 100 : 0;

  // Faturamento e Lucro por mês (do ano filtrado, ignorando filtro de mês)
  const faturamentoPorMes = Array.from({ length: 12 }, (_, i) => {
    const procedimentosDoMes = procedimentosParaGrafico.filter(p => {
      if (!p.data_procedimento) return false;
      const data = new Date(p.data_procedimento);
      return data.getFullYear() === filtroAno && data.getMonth() === i;
    });
    const total = procedimentosDoMes.reduce((acc, p) => acc + (p.valor_cobrado || 0), 0);
    const lucro = procedimentosDoMes.reduce((acc, p) => {
      const valor = Number(p.valor_cobrado) || 0;
      const custoProduto = Number(p.custo_produto) || 0;
      const custoSala = Number(p.custo_sala) || 0;
      const custoInsumos = Number(p.custo_insumos) || 0;
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