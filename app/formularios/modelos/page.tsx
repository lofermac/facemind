// app/formularios/modelos/page.tsx
'use client';

import React, { useState, useEffect, useCallback, FormEvent } from 'react';
import Link from 'next/link'; 
import { supabase } from '@/utils/supabaseClient';
import { toast } from 'sonner';
import { TagIcon, PlusCircleIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface FormCategory {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export default function GerenciarCategoriasModeloPage() {
  const [categories, setCategories] = useState<FormCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [editingCategory, setEditingCategory] = useState<FormCategory | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('form_categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      toast.error('Erro ao buscar categorias: ' + error.message);
      setCategories([]);
    } else if (data) {
      setCategories(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newCategoryName.trim()) {
      toast.error('O nome da categoria é obrigatório.');
      return;
    }

    let error;
    const categoryData = {
        name: newCategoryName.trim(),
        description: newCategoryDescription.trim() || null
    };

    if (editingCategory) {
      // Modo Edição
      const { error: updateError } = await supabase
        .from('form_categories')
        .update(categoryData)
        .eq('id', editingCategory.id);
      error = updateError;
    } else {
      // Modo Criação
      const { error: insertError } = await supabase
        .from('form_categories')
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
      fetchCategories(); 
    }
  };
  
  const handleEdit = (category: FormCategory) => {
    setEditingCategory(category);
    setNewCategoryName(category.name);
    setNewCategoryDescription(category.description || '');
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Rola para o topo para ver o formulário
  };

  const handleDelete = async (categoryId: string, categoryName: string) => {
    // TODO: Implementar lógica para verificar/alertar sobre templates existentes nesta categoria
    // antes de permitir a exclusão da categoria, ou definir exclusão em cascata no DB.
    if (window.confirm(`Tem certeza que deseja excluir a categoria "${categoryName}"? (Atenção: Modelos de formulário dentro dela podem precisar ser removidos ou reatribuídos manualmente por enquanto).`)) {
      const { error } = await supabase.from('form_categories').delete().eq('id', categoryId);
      if (error) {
        toast.error(`Erro ao deletar categoria: ${error.message}`);
      } else {
        toast.success(`Categoria "${categoryName}" deletada com sucesso.`);
        fetchCategories();
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

  if (loading && categories.length === 0) { // Mostrar loading inicial mais robusto
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
          Categorias de Modelos
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
            {editingCategory ? `Editando Categoria: ${editingCategory.name}` : 'Adicionar Nova Categoria'}
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

      {categories.length === 0 && !showForm && !loading && (
        <div className="text-center bg-white p-8 sm:p-12 rounded-xl shadow-lg border border-slate-200">
          <TagIcon className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 text-xl font-medium">Nenhuma categoria de modelo encontrada.</p>
          <p className="text-slate-500 mt-2">Clique em "Nova Categoria" para começar a organizar seus formulários.</p>
        </div>
      )}

      {categories.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
          {categories.map((category) => (
            <Link href={`/formularios/modelos/${category.id}`} key={category.id}>
              <div 
                className="relative bg-white shadow rounded-lg p-6 transition-transform transform hover:scale-105 hover:shadow-lg"
              >
                <div className="flex justify-center items-center mb-2">
                  <div className="flex-1 text-center">
                    <p className="text-lg font-bold text-gray-900 leading-tight mb-1 hover:text-blue-600 cursor-pointer">
                      {category.name}
                    </p>
                    {category.description && (
                      <p className="text-sm text-slate-500 truncate" title={category.description}>
                        {category.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}