'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { PiggyBank, Coins, LineChart, Percent, ListChecks, Package, FlaskConical, Building2 } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, Line
} from 'recharts';
import { BarProps } from 'recharts';

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

const mesesNomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const CustomBar = (props: BarProps & { barColor: string; gradientId: string }) => {
  const { fill, barColor, gradientId, ...rest } = props;
  return <Bar fill={`url(#${gradientId})`} {...rest} />;
};

export default function FinanceiroPage() {
  const [procedimentos, setProcedimentos] = useState<ProcedimentoFinanceiro[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroAno, setFiltroAno] = useState(new Date().getFullYear());
  const [filtroMes, setFiltroMes] = useState(0); // 0 = todos os meses
  const [categorias, setCategorias] = useState<string[]>([]);
  const [anos, setAnos] = useState<number[]>([]);
  const [abaSelecionada, setAbaSelecionada] = useState<'overview' | 'smart'>('smart');

  useEffect(() => {
    async function fetchProcedimentos() {
      setLoading(true);
      // Buscar procedimentos com nome do paciente
      const { data, error } = await supabase
        .from('procedimentos_realizados')
        .select('id, data_procedimento, procedimento_nome, categoria_nome, valor_cobrado, custo_produto, custo_insumos, custo_sala, paciente_id, pacientes (nome)')
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

  // Filtros complexos para os cards (ano, mês, categoria)
  const procedimentosFiltrados = procedimentos.filter(p => {
    if (!p.data_procedimento) return false;
    const data = new Date(p.data_procedimento);
    const matchAno = filtroAno ? data.getFullYear() === filtroAno : true;
    const matchMes = filtroMes ? data.getMonth() + 1 === filtroMes : true;
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
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold leading-9 text-gray-900 sm:text-4xl sm:truncate">Financeiro</h1>
          <p className="mt-2 text-base text-gray-600">Visualize e gerencie todos os dados financeiros da clínica</p>
        </div>
        {/* Menu de abas sutil no topo */}
        <div className="flex items-center mb-2">
          <div className="flex space-x-2 bg-slate-100 rounded-full p-1 shadow-sm text-sm">
            <button
              className={`px-4 py-1 rounded-full transition-colors duration-150 ${abaSelecionada === 'overview' ? 'bg-white text-blue-600 shadow' : 'text-gray-500 hover:text-blue-600'}`}
              onClick={() => setAbaSelecionada('overview')}
            >
              Overview
            </button>
            <button
              className={`px-4 py-1 rounded-full transition-colors duration-150 ${abaSelecionada === 'smart' ? 'bg-white text-green-600 shadow' : 'text-gray-500 hover:text-green-600'}`}
              onClick={() => setAbaSelecionada('smart')}
            >
              Smart
            </button>
          </div>
        </div>
        {/* Filtros avançados: só aparecem na aba Smart */}
        {abaSelecionada === 'smart' && (
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-6">
            <select
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full md:w-auto sm:text-base border-gray-300 rounded-md p-3"
              value={filtroAno}
              onChange={e => setFiltroAno(Number(e.target.value))}
            >
              {anos.map(ano => (
                <option key={ano} value={ano}>{ano}</option>
              ))}
            </select>
            <select
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full md:w-auto sm:text-base border-gray-300 rounded-md p-3"
              value={filtroMes}
              onChange={e => setFiltroMes(Number(e.target.value))}
            >
              <option value={0}>Todos os Meses</option>
              {mesesNomes.map((mes, idx) => (
                <option key={mes} value={idx + 1}>{mes}</option>
              ))}
            </select>
            <select
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full md:w-auto sm:text-base border-gray-300 rounded-md p-3"
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
        {abaSelecionada === 'smart' && (
          <>
            {/* Primeira linha: Faturamento, Custos, Lucro, Margem de Lucro */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow p-6 h-40 flex flex-col items-center justify-center text-center">
                <PiggyBank className="w-10 h-10 text-green-500 mb-2" />
                <div className="text-gray-500 text-sm">Faturamento</div>
                <div className="text-2xl font-bold">{formatarValor(totalFaturado)}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6 h-40 flex flex-col items-center justify-center text-center">
                <Coins className="w-10 h-10 text-red-500 mb-2" />
                <div className="text-gray-500 text-sm">Custos</div>
                <div className="text-2xl font-bold">{formatarValor(totalCustos)}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6 h-40 flex flex-col items-center justify-center text-center">
                <LineChart className="w-10 h-10 text-blue-500 mb-2" />
                <div className="text-gray-500 text-sm">Lucro</div>
                <div className="text-2xl font-bold">{formatarValor(lucroPeriodo)}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6 h-40 flex flex-col items-center justify-center text-center">
                <Percent className="w-10 h-10 text-yellow-500 mb-2" />
                <div className="text-gray-500 text-sm">Margem de Lucro</div>
                <div className="text-2xl font-bold">{margemLucro.toFixed(1)}%</div>
              </div>
            </div>
            {/* Segunda linha: Procedimentos, Custo com Produtos, Custo com Insumos, Custo com Sala */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow p-6 h-40 flex flex-col items-center justify-center text-center">
                <ListChecks className="w-10 h-10 text-purple-500 mb-2" />
                <div className="text-gray-500 text-sm">Procedimentos</div>
                <div className="text-2xl font-bold">{procedimentosFiltrados.length}</div>
                <div className="text-gray-400 text-xs mt-1">Ticket Médio: {formatarValor(ticketMedio)}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6 h-40 flex flex-col items-center justify-center text-center">
                <Package className="w-10 h-10 text-red-500 mb-2" />
                <div className="text-gray-500 text-sm">Custo com Produtos</div>
                <div className="text-2xl font-bold">{formatarValor(totalCustoProdutos)}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6 h-40 flex flex-col items-center justify-center text-center">
                <FlaskConical className="w-10 h-10 text-yellow-500 mb-2" />
                <div className="text-gray-500 text-sm">Custo com Insumos</div>
                <div className="text-2xl font-bold">{formatarValor(totalCustoInsumos)}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6 h-40 flex flex-col items-center justify-center text-center">
                <Building2 className="w-10 h-10 text-blue-500 mb-2" />
                <div className="text-gray-500 text-sm">Custo com Sala</div>
                <div className="text-2xl font-bold">{formatarValor(totalCustoSala)}</div>
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
        {abaSelecionada === 'smart' && (
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-100 mt-6">
            <h2 className="text-2xl font-bold text-blue-700 mb-6 flex items-center gap-2">
              <ListChecks className="w-7 h-7 text-blue-400" /> Procedimentos
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-center rounded-xl overflow-hidden">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Data</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Paciente</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Procedimento</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Categoria</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Valor</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {loading ? (
                    <tr><td colSpan={5} className="text-center py-8">Carregando...</td></tr>
                  ) : procedimentosFiltrados.slice(0, 10).map(proc => (
                    <tr key={proc.id} className="hover:bg-blue-50 transition rounded-xl">
                      <td className="px-6 py-3 whitespace-nowrap font-medium text-gray-700">{formatarData(proc.data_procedimento)}</td>
                      <td className="px-6 py-3 whitespace-nowrap text-gray-700">{proc.paciente_nome}</td>
                      <td className="px-6 py-3 whitespace-nowrap text-blue-700 font-semibold">{proc.procedimento_nome}</td>
                      <td className="px-6 py-3 whitespace-nowrap text-gray-500">{proc.categoria_nome}</td>
                      <td className="px-6 py-3 whitespace-nowrap font-bold text-green-600">{formatarValor(proc.valor_cobrado)}</td>
                    </tr>
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