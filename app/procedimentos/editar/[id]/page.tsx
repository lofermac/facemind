// app/procedimentos/editar/[id]/page.tsx
'use client';

console.log('editar/[id]/page.tsx carregado - VERSÃO IMPORT CORRIGIDO');

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';
import ProcedimentoForm, { ProcedimentoRealizadoExistente } from '@/components/ProcedimentoForm'; 
import { toast } from 'sonner';

export default function EditarProcedimentoPage() {
  const router = useRouter();
  const params = useParams();
  const procedimentoId = params && typeof params.id === 'string' ? params.id : '';

  const [procedimentoParaEditar, setProcedimentoParaEditar] = useState<ProcedimentoRealizadoExistente | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (procedimentoId) {
      const fetchProcedimento = async () => {
        setLoading(true);
        setNotFound(false);
        const { data, error } = await supabase
          .from('procedimentos_realizados')
          .select(`
            *,
            procedimento_tabela_valores_id (
              nome_procedimento
            )
          `)
          .eq('id', procedimentoId)
          .single();

        if (error) {
          console.error('Erro ao buscar procedimento para edição:', error);
          toast.error('Falha ao carregar dados do procedimento.');
          setNotFound(true);
        } else if (data) {
          // Extrair o nome do procedimento do join
          const procedimentoNome = data.procedimento_tabela_valores_id?.nome_procedimento || '';
          
          // Criar objeto com nome do procedimento para pré-seleção
          const procedimentoComNome = {
            ...data,
            procedimento_nome: procedimentoNome
          } as ProcedimentoRealizadoExistente;
          
          setProcedimentoParaEditar(procedimentoComNome);
        } else {
          setNotFound(true);
          toast.error('Procedimento não encontrado.');
        }
        setLoading(false);
      };
      fetchProcedimento();
    } else {
      toast.error('ID do procedimento não fornecido.');
      setLoading(false);
      setNotFound(true);
    }
  }, [procedimentoId]);

  const handleSave = () => router.push('/procedimentos');
  const handleCancel = () => router.back();

  if (loading) return <div className="p-6 text-center">Carregando dados do procedimento...</div>;

  if (notFound) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500">Procedimento não encontrado ou ID inválido.</p>
        <button onClick={() => router.push('/procedimentos')} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Voltar para a lista de procedimentos
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
          <div className="flex items-center justify-between">
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors font-bold"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Voltar
            </button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Editar Procedimento</h1>
            </div>
            <div className="flex items-center gap-2 text-slate-500">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-sm font-medium">Modo Edição</span>
            </div>
          </div>
        </div>

        {/* Formulário */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          {procedimentoParaEditar && (
            <ProcedimentoForm
              procedimentoInicial={procedimentoParaEditar}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          )}
        </div>
      </div>
    </div>
  );
}