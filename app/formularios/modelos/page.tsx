// app/formularios/modelos/page.tsx
'use client';

import React, { useState, useEffect, useCallback, FormEvent } from 'react';
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

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData) {
      toast.error('Usuário não autenticado.');
      return;
    }

    let error;
    const categoryData = {
        name: newCategoryName.trim(),
        description: newCategoryDescription.trim() || null,
        user_id: userData.user.id
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
    if (window.confirm(`Tem certeza que deseja excluir a categoria "${categoryName}"? (Todos os arquivos associados a ela também serão removidos)`)) {
      // Primeiro, delete todos os arquivos em form_files com aquele category_id
      const { error: filesError } = await supabase.from('form_files').delete().eq('category_id', categoryId);
      if (filesError) {
        toast.error(`Erro ao deletar arquivos da categoria: ${filesError.message}`);
        return;
      }
      // Agora, delete a categoria
      const { error } = await supabase.from('form_categories').delete().eq('id', categoryId);
      if (error) {
        toast.error(`Erro ao deletar categoria: ${error.message}`);
      } else {
        toast.success(`Categoria "${categoryName}" e arquivos associados deletados com sucesso.`);
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

  if (loading && categories.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-lg text-slate-600">Carregando categorias...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Categorias de Modelos</h1>
            <p className="text-slate-600 text-sm mt-1">Gerencie as categorias dos seus formulários</p>
          </div>
          <button
            onClick={openNewCategoryForm}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center"
          >
            <PlusCircleIcon className="h-5 w-5 mr-2" />
            Nova Categoria
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-6">
              {editingCategory ? `Editando Categoria: ${editingCategory.name}` : 'Adicionar Nova Categoria'}
            </h2>
            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div>
                <label htmlFor="categoryName" className="block text-sm font-medium text-slate-700 mb-2">
                  Nome da Categoria <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="categoryName"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="categoryDescription" className="block text-sm font-medium text-slate-700 mb-2">
                  Descrição (Opcional)
                </label>
                <textarea
                  id="categoryDescription"
                  value={newCategoryDescription}
                  onChange={(e) => setNewCategoryDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setEditingCategory(null); }}
                  className="px-6 py-2 border border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
                >
                  {editingCategory ? 'Salvar Alterações' : 'Criar Categoria'}
                </button>
              </div>
            </form>
          </div>
        )}

        {categories.length === 0 && !showForm && !loading && (
          <div className="text-center bg-white p-12 rounded-2xl shadow-lg">
            <TagIcon className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 text-xl font-medium">Nenhuma categoria de modelo encontrada.</p>
            <p className="text-slate-500 mt-2">Clique em "Nova Categoria" para começar a organizar seus formulários.</p>
          </div>
        )}

        {categories.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <div key={category.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="p-6 pb-4">
                  <div className="text-center">
                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                      {category.name}
                    </h3>
                    {category.description && (
                      <p className="text-sm text-slate-500 line-clamp-2" title={category.description}>
                        {category.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex justify-center space-x-3 pb-4">
                  <button
                    onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleEdit(category); }}
                    className="p-2 rounded-lg text-slate-400 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                    title="Editar Categoria"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleDelete(category.id, category.name); }}
                    className="p-2 rounded-lg text-slate-400 hover:text-red-700 hover:bg-red-50 transition-colors"
                    title="Excluir Categoria"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}