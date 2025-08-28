// INÍCIO DO CÓDIGO COMPLETO PARA app/tabela-valores/[categoriaId]/page.tsx (COM duracao_efeito_meses)
// app/tabela-valores/[categoriaId]/page.tsx
'use client';

console.log('page.tsx (Procedimentos por Categoria) CARREGADO - VERSÃO COM DURACAO_EFEITO_MESES');

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient'; 
import { toast } from 'sonner';
import ProcedimentoValorFormModal from '@/components/ProcedimentoValorFormModal'; 
import AppleLikeLoader from '@/components/AppleLikeLoader';

interface CategoriaDetalhes {
  id: string;
  nome: string;
}

export interface ProcedimentoValor { 
  id: string;
  created_at: string;
  categoria_id: string;
  nome_procedimento: string;
  valor_pix: number | null;
  valor_4x: number | null;
  valor_6x: number | null;
  observacoes?: string | null;
  duracao_efeito_meses?: number | null; // ✨ ADICIONADO ✨
}

function formatarValorMonetario(valor: number | null): string {
  if (valor === null || valor === undefined) return 'R$ -';
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function ProcedimentosPorCategoriaPage() {
  const router = useRouter();
  const params = useParams();
  const categoriaId = params.categoriaId as string;

  const [categoria, setCategoria] = useState<CategoriaDetalhes | null>(null);
  const [procedimentos, setProcedimentos] = useState<ProcedimentoValor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isPvModalOpen, setIsPvModalOpen] = useState(false);
  const [procedimentoParaEditar, setProcedimentoParaEditar] = useState<ProcedimentoValor | null>(null);

  async function fetchDadosDaPagina() {
    if (!categoriaId) {
      toast.error('ID da categoria não fornecido.');
      setLoading(false);
      router.push('/tabela-valores');
      return;
    }
    setLoading(true);
    const { data: categoriaData, error: categoriaError } = await supabase
      .from('categorias_procedimentos').select('id, nome').eq('id', categoriaId).single();

    if (categoriaError || !categoriaData) {
      toast.error(categoriaError?.message || 'Categoria não encontrada.');
      setLoading(false); router.push('/tabela-valores'); return;
    }
    setCategoria(categoriaData as CategoriaDetalhes);
    await fetchProcedimentosDaCategoria();
    setLoading(false);
  }
  
  async function fetchProcedimentosDaCategoria() {
    if (!categoriaId) return; 
    const { data: procedimentosData, error: procedimentosError } = await supabase
      .from('procedimentos_tabela_valores').select('*').eq('categoria_id', categoriaId).order('nome_procedimento', { ascending: true });
    if (procedimentosError) {
      toast.error(`Erro ao carregar procedimentos: ${procedimentosError.message}`); setProcedimentos([]);
    } else setProcedimentos((procedimentosData as ProcedimentoValor[]) || []);
  }

  useEffect(() => { fetchDadosDaPagina(); }, [categoriaId]);

  const handleOpenPvModalParaNovo = () => { setProcedimentoParaEditar(null); setIsPvModalOpen(true); };
  const handleOpenPvModalParaEditar = (procedimento: ProcedimentoValor) => { setProcedimentoParaEditar(procedimento); setIsPvModalOpen(true); };
  const handleClosePvModal = () => { setIsPvModalOpen(false); setProcedimentoParaEditar(null); };
  const handleProcedimentoValorSaved = () => { fetchProcedimentosDaCategoria(); handleClosePvModal(); };
  
  const handleDeleteProcedimentoValor = async (procedimentoId: string, nomeProcedimento: string) => {
    if (window.confirm(`Excluir "${nomeProcedimento}" da tabela de valores?`)) {
      const { error } = await supabase.from('procedimentos_tabela_valores').delete().eq('id', procedimentoId);
      if (error) toast.error(`Erro ao excluir: ${error.message}`);
      else { toast.success(`"${nomeProcedimento}" excluído!`); fetchProcedimentosDaCategoria(); }
    }
  };

  const handleAddProcedimentoValor = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Você precisa estar logado para realizar esta ação.');
      setIsSubmitting(false);
      return;
    }

    const procedimentoValorData = {
      ...dadosOriginais,
      user_id: user.id,
      nome_procedimento: nomeProcedimento.trim(),
      valor_pix: valorPix,
      valor_4x: valor4x,
      valor_6x: valor6x,
      observacoes: observacoes.trim() || null,
      duracao_efeito_meses: duracaoEfeitoMeses || null,
      categoria_id: categoriaId
    };

    const { error } = await supabase
      .from('procedimentos_tabela_valores')
      .insert([procedimentoValorData]);

    setIsSubmitting(false);

    if (error) {
      toast.error(`Erro ao adicionar procedimento valor: ${error.message}`);
    } else {
      toast.success('Procedimento valor adicionado com sucesso!');
      fetchProcedimentos();
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <AppleLikeLoader />
        </div>
      </div>
    </div>
  );
  if (!categoria) return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center text-red-500">Categoria não encontrada.</div>
      </div>
    </div>
  );

  const procedimentosFiltrados = procedimentos.filter(p =>
    p.nome_procedimento?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <button onClick={() => router.push('/tabela-valores')} className="text-sm text-blue-600 hover:text-blue-800 flex items-center font-bold mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Voltar para Categorias
            </button>
            <h1 className="text-2xl font-bold text-slate-900">{categoria.nome}</h1>
            <p className="text-slate-600 text-sm mt-1">Itens da tabela de valores para {categoria.nome}</p>
          </div>
          <button type="button" onClick={handleOpenPvModalParaNovo}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center">
            <span className="mr-2">+</span>
            Novo Item na Tabela
          </button>
        </div>

        {/* Busca */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Buscar por nome do procedimento..."
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Tabela */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Procedimento</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Duração (Meses)</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Pix</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">4x</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">6x</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {loading && procedimentosFiltrados.length === 0 && (
                  <tr><td colSpan={6} className="px-6 py-12 text-center"><AppleLikeLoader /></td></tr>
                )}
                {!loading && procedimentosFiltrados.length === 0 && (
                  <tr><td colSpan={6} className="px-6 py-10 text-center text-sm text-slate-500">Nenhum item cadastrado.</td></tr>
                )}
                {!loading && procedimentosFiltrados.map((proc, idx) => (
                  <tr key={proc.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-blue-50 transition-colors`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">{proc.nome_procedimento}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{proc.duracao_efeito_meses ?? '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">{formatarValorMonetario(proc.valor_pix)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{formatarValorMonetario(proc.valor_4x)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{formatarValorMonetario(proc.valor_6x)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button onClick={() => handleOpenPvModalParaEditar(proc)} className="inline-flex items-center px-3 py-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 mr-2 transition-colors" title="Editar">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button onClick={() => handleDeleteProcedimentoValor(proc.id, proc.nome_procedimento)} className="inline-flex items-center px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors" title="Excluir">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ProcedimentoValorFormModal
        isOpen={isPvModalOpen}
        onClose={handleClosePvModal}
        onProcedimentoValorSaved={handleProcedimentoValorSaved}
        categoriaId={categoriaId}
        procedimentoParaEditar={procedimentoParaEditar}
      />
    </div>
  );
}