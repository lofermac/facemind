// app/procedimentos/editar/[id]/page.tsx
'use client';

console.log('editar/[id]/page.tsx carregado - VERSÃO IMPORT CORRIGIDO');

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';
// 👇 NOME DA INTERFACE CORRIGIDO AQUI 👇
import ProcedimentoForm, { ProcedimentoRealizadoExistente } from '@/components/ProcedimentoForm'; 
import { toast } from 'sonner';

export default function EditarProcedimentoPage() {
  const router = useRouter();
  const params = useParams();
  const procedimentoId = params && typeof params.id === 'string' ? params.id : '';

  // Usar a interface correta importada
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
          .select('*')
          .eq('id', procedimentoId)
          .single();

        if (error) {
          console.error('Erro ao buscar procedimento para edição:', error);
          toast.error('Falha ao carregar dados do procedimento.');
          setNotFound(true);
        } else if (data) {
          // Ajuste para corresponder à interface ProcedimentoRealizadoExistente
          // A interface ProcedimentoFormData (base) já está correta para os campos.
          // O casting para ProcedimentoRealizadoExistente deve funcionar se 'data' tiver id e created_at.
          setProcedimentoParaEditar(data as ProcedimentoRealizadoExistente);
        } else {
          setNotFound(true);
          toast.error('Procedimento não encontrado.');
        }
        setLoading(false);
      };
      fetchProcedimento();
    } else {
      toast.error("ID do procedimento não fornecido.");
      setLoading(false);
      setNotFound(true);
    }
  }, [procedimentoId]);

  const handleSave = (idDoProcedimentoSalvo?: string) => {
    router.push('/procedimentos');
  };

  const handleCancel = () => {
    router.back();
  };

  if (loading) {
    return <div className="p-6 text-center">Carregando dados do procedimento...</div>;
  }

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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 mb-6">
            Editar Procedimento
          </h2>
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