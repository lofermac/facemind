// components/CategoriaFormModal.tsx
'use client';

console.log('CategoriaFormModal.tsx carregado - VERSÃO INICIAL'); // Para debug

import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient'; // Ajuste se sua pasta utils for em outro nível
import { toast } from 'sonner';
// Precisamos da interface Categoria aqui também, ou de uma forma de passá-la.
// Por simplicidade, vamos redefinir uma interface similar aqui por enquanto.
// O ideal seria ter um arquivo de tipos compartilhado.
export interface CategoriaInput { // Pode ser diferente da Categoria com 'id' e 'created_at'
  nome: string;
  descricao?: string | null;
}
export interface Categoria extends CategoriaInput {
    id: string;
    created_at: string;
}


interface CategoriaFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCategoriaSaved: () => void;
  categoriaParaEditar?: Categoria | null;
}

export default function CategoriaFormModal({ 
  isOpen, 
  onClose, 
  onCategoriaSaved, 
  categoriaParaEditar 
}: CategoriaFormModalProps) {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = !!categoriaParaEditar;

  useEffect(() => {
    // Preenche os campos se estiver editando e o modal for aberto
    if (isOpen) { 
      if (isEditMode && categoriaParaEditar) {
        console.log("Modal aberto para editar categoria:", categoriaParaEditar);
        setNome(categoriaParaEditar.nome || '');
        setDescricao(categoriaParaEditar.descricao || '');
      } else {
        console.log("Modal aberto para nova categoria ou categoriaParaEditar é nulo.");
        setNome('');
        setDescricao('');
      }
    }
  }, [isOpen, categoriaParaEditar, isEditMode]); // Re-executa quando isOpen, categoriaParaEditar ou isEditMode mudam

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Você precisa estar logado para realizar esta ação.');
      setIsSubmitting(false);
      return;
    }

    const dadosCategoria: CategoriaInput = {
      ...dadosOriginais,
      user_id: user.id,
      nome: nome.trim(),
      descricao: descricao.trim() || null
    };

    let errorObj = null;

    if (isEditMode && categoriaParaEditar) {
      const { error } = await supabase
        .from('categorias_procedimentos')
        .update(dadosCategoria)
        .eq('id', categoriaParaEditar.id);
      errorObj = error;
    } else {
      const { data, error } = await supabase
        .from('categorias_procedimentos')
        .insert([dadosCategoria])
        .select();
      errorObj = error;
    }

    setIsSubmitting(false);

    if (errorObj) {
        toast.error(`Erro ao salvar categoria: ${errorObj.message}`);
    } else {
      toast.success(`Categoria ${isEditMode ? 'atualizada' : 'criada'} com sucesso!`);
      onCategoriaSaved();
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex justify-center items-center px-4">
      <div className="relative mx-auto p-6 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-xl font-semibold text-gray-900">
            {isEditMode ? 'Editar Categoria' : 'Nova Categoria'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
            disabled={isSubmitting}
            aria-label="Fechar modal"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="nome-categoria" className="block text-sm font-medium text-gray-700">
              Nome da Categoria <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="nome-categoria"
              id="nome-categoria"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
              placeholder="Ex: Preenchimentos"
            />
          </div>
          <div>
            <label htmlFor="descricao-categoria" className="block text-sm font-medium text-gray-700">
              Descrição (Opcional)
            </label>
            <textarea
              name="descricao-categoria"
              id="descricao-categoria"
              rows={3}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
              placeholder="Detalhes sobre a categoria..."
            ></textarea>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md shadow-sm text-sm"
            >
              {isEditMode ? 'Salvar Alterações' : 'Criar Categoria'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}