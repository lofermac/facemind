// INÍCIO DO CÓDIGO COMPLETO PARA app/tabela-valores/[categoriaId]/page.tsx (COM duracao_efeito_meses)
// app/tabela-valores/[categoriaId]/page.tsx
'use client';

console.log('page.tsx (Procedimentos por Categoria) CARREGADO - VERSÃO COM DURACAO_EFEITO_MESES');

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient'; 
import { toast } from 'sonner';
import ProcedimentoValorFormModal from '@/components/ProcedimentoValorFormModal'; 

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
      toast.error("ID da categoria não fornecido.");
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

  if (loading) return <div className="p-6 text-center">Carregando...</div>;
  if (!categoria) return <div className="p-6 text-center text-red-500">Categoria não encontrada.</div>;

  const procedimentosFiltrados = procedimentos.filter(p =>
    p.nome_procedimento?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <button onClick={() => router.push('/tabela-valores')} className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
          Voltar para Categorias
        </button>
      </div>
      <div className="mb-6 md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">{categoria.nome}</h2>
          <p className="mt-1 text-sm text-gray-500">Itens da tabela de valores para {categoria.nome}</p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button type="button" onClick={handleOpenPvModalParaNovo}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
            + Novo Item na Tabela
          </button>
        </div>
      </div>
      <div className="mb-6">
        <input type="text" placeholder="Buscar por nome do procedimento..."
          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-3"
          value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="border-t border-gray-200 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Procedimento</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duração (Meses)</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pix</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">4x</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">6x</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading && procedimentosFiltrados.length === 0 && ( <tr><td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-500">Carregando...</td></tr> )}
              {!loading && procedimentosFiltrados.length === 0 && ( <tr><td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-500">Nenhum item cadastrado.</td></tr> )}
              {!loading && procedimentosFiltrados.map((proc) => (
                <tr key={proc.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{proc.nome_procedimento}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{proc.duracao_efeito_meses ?? '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatarValorMonetario(proc.valor_pix)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatarValorMonetario(proc.valor_4x)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatarValorMonetario(proc.valor_6x)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button onClick={() => handleOpenPvModalParaEditar(proc)} className="text-blue-600 hover:text-blue-900" title="Editar">✏️</button>
                    <button onClick={() => handleDeleteProcedimentoValor(proc.id, proc.nome_procedimento)} className="text-red-600 hover:text-red-900" title="Excluir">🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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