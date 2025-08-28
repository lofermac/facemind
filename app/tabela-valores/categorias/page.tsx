'use client';

import React, { useState, useEffect, useCallback, FormEvent } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { toast } from 'sonner';
import { PlusCircleIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import AppleLikeLoader from '@/components/AppleLikeLoader';

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
      const { error: updateError } = await supabase
        .from('categorias_procedimentos')
        .update(categoryData)
        .eq('id', editingCategory.id);
      error = updateError;
    } else {
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
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <AppleLikeLoader />
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
            <h1 className="text-2xl font-bold text-slate-900">Categorias de Procedimentos</h1>
            <p className="text-slate-600 text-sm mt-1">Gerencie as categorias da sua tabela de valores</p>
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
              {editingCategory ? `Editando Categoria: ${editingCategory.nome}` : 'Adicionar Nova Categoria'}
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

        {categorias.length === 0 && !showForm && !loading && (
          <div className="text-center bg-white p-12 rounded-2xl shadow-lg">
            <p className="text-slate-600 text-xl font-medium">Nenhuma categoria encontrada.</p>
            <p className="text-slate-500 mt-2">Clique em "Nova Categoria" para começar a organizar seus procedimentos.</p>
          </div>
        )}

        {categorias.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <ul role="list" className="divide-y divide-slate-200">
              {categorias.map((categoria) => (
                <li key={categoria.id} className="px-6 py-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between space-x-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-slate-900 truncate" title={categoria.nome}>{categoria.nome}</h3>
                      {categoria.descricao && (
                        <p className="text-sm text-slate-500 truncate mt-1" title={categoria.descricao}>{categoria.descricao}</p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEdit(categoria)}
                        className="p-2 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition-colors" 
                        title="Editar Categoria">
                        <PencilIcon className="h-5 w-5"/>
                      </button>
                      <button 
                        onClick={() => handleDelete(categoria.id, categoria.nome)}
                        className="p-2 rounded-lg text-slate-500 hover:text-red-700 hover:bg-red-50 transition-colors" 
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
    </div>
  );
} 