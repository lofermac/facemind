// app/formularios/modelos/[categoryId]/page.tsx
'use client';

import React, { useState, useEffect, useCallback, FormEvent } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { toast } from 'sonner';
import { PlusCircleIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface Categoria {
  id: string;
  nome: string;
  descricao: string | null;
  created_at: string;
}

export default function GerenciarCategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [editingCategory, setEditingCategory] = useState<Categoria | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCategorias = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('categorias_procedimentos')
      .select('*')
      .order('nome', { ascending: true });

    if (error) {
      toast.error('Erro ao buscar categorias: ' + error.message);
      setCategorias([]);
    } else if (data) {
      setCategorias(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCategorias();
  }, [fetchCategorias]);

  const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log('Tentando salvar categoria:', newCategoryName);
    if (!newCategoryName.trim()) {
      toast.error('O nome da categoria é obrigatório.');
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Você precisa estar logado para realizar esta ação.');
      return;
    }

    let error;
    const categoryData = {
        nome: newCategoryName.trim(),
        descricao: newCategoryDescription.trim() || null,
        user_id: user.id
    };

    if (editingCategory) {
      console.log('Editando categoria com ID:', editingCategory.id);
      const { error: updateError } = await supabase
        .from('categorias_procedimentos')
        .update(categoryData)
        .eq('id', editingCategory.id);
      error = updateError;
    } else {
      console.log('Criando nova categoria');
      const { error: insertError } = await supabase
        .from('categorias_procedimentos')
        .insert([categoryData]);
      error = insertError;
    }

    if (error) {
      toast.error(`Erro ao salvar categoria: ${error.message}`);
    } else {
      toast.success(`Categoria ${editingCategory ? 'atualizada' : 'criada'} com sucesso!`);
      setShowForm(false);
      setNewCategoryName('');
      setNewCategoryDescription('');
      setEditingCategory(null);
      fetchCategorias();
    }
  };

  const handleEdit = (category: Categoria) => {
    setEditingCategory(category);
    setNewCategoryName(category.nome);
    setNewCategoryDescription(category.descricao || '');
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (categoryId: string, categoryName: string) => {
    console.log('Tentando excluir categoria com ID:', categoryId);
    if (window.confirm(`Tem certeza que deseja excluir a categoria "${categoryName}"?`)) {
      const { error } = await supabase.from('categorias_procedimentos').delete().eq('id', categoryId);
      if (error) {
        toast.error(`Erro ao deletar categoria: ${error.message}`);
      } else {
        toast.success(`Categoria "${categoryName}" deletada com sucesso.`);
        fetchCategorias();
      }
    }
  };

  const openNewCategoryForm = () => {
    setEditingCategory(null);
    setNewCategoryName('');
    setNewCategoryDescription('');
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading && categorias.length === 0) {
    return (
      <div className="container mx-auto p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-sky-500 mx-auto"></div>
        <p className="mt-4 text-lg text-gray-600">Carregando categorias...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8 pb-4 border-b border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
          Categorias de Procedimentos
        </h1>
        <button
          onClick={openNewCategoryForm}
          className="mt-4 sm:mt-0 bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition duration-150 ease-in-out flex items-center"
        >
          <PlusCircleIcon className="h-5 w-5 mr-2" />
          Nova Categoria
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-xl mb-8 border border-slate-200">
          <h2 className="text-xl font-semibold text-slate-700 mb-5">
            {editingCategory ? `Editando Categoria: ${editingCategory.nome}` : 'Adicionar Nova Categoria'}
          </h2>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label htmlFor="categoryName" className="block text-sm font-medium text-slate-700">
                Nome da Categoria <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="categoryName"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="categoryDescription" className="block text-sm font-medium text-slate-700">
                Descrição (Opcional)
              </label>
              <textarea
                id="categoryDescription"
                value={newCategoryDescription}
                onChange={(e) => setNewCategoryDescription(e.target.value)}
                rows={3}
                className="mt-1 block w-full px-4 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
              />
            </div>
            <div className="flex justify-end space-x-3 pt-3">
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditingCategory(null); }}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-4 rounded-md shadow-sm text-sm"
              >
                {editingCategory ? 'Salvar Alterações' : 'Criar Categoria'}
              </button>
            </div>
          </form>
        </div>
      )}

      {categorias.length === 0 && !showForm && !loading && (
        <div className="text-center bg-white p-8 sm:p-12 rounded-xl shadow-lg border border-slate-200">
          <p className="text-slate-600 text-xl font-medium">Nenhuma categoria encontrada.</p>
          <p className="text-slate-500 mt-2">Clique em "Nova Categoria" para começar a organizar seus procedimentos.</p>
        </div>
      )}

      {categorias.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          <ul role="list" className="divide-y divide-slate-200">
            {categorias.map((categoria) => (
              <li key={categoria.id} className="px-4 py-4 sm:px-6 hover:bg-sky-50 transition-colors duration-150">
                <div className="flex items-center justify-between space-x-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-semibold text-sky-700 truncate" title={categoria.nome}>{categoria.nome}</p>
                    {categoria.descricao && (
                      <p className="text-sm text-slate-500 truncate" title={categoria.descricao}>{categoria.descricao}</p>
                    )}
                  </div>
                  <div className="flex-shrink-0 flex space-x-2">
                    <button 
                        onClick={() => handleEdit(categoria)}
                        className="p-2 rounded-md text-slate-500 hover:text-sky-700 hover:bg-sky-100 transition-colors" 
                        title="Editar Categoria">
                        <PencilIcon className="h-5 w-5"/>
                    </button>
                    <button 
                        onClick={() => handleDelete(categoria.id, categoria.nome)}
                        className="p-2 rounded-md text-slate-500 hover:text-red-700 hover:bg-red-100 transition-colors" 
                        title="Excluir Categoria">
                        <TrashIcon className="h-5 w-5"/>
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}