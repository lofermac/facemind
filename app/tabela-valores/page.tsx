// app/tabela-valores/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient'; // Usando alias
import { toast } from 'sonner';
import CategoriaFormModal from '@/components/CategoriaFormModal'; // Usando alias
import '../styles/tabela-valores.css';
import { PencilIcon, TrashIcon, PlusCircleIcon } from '@heroicons/react/24/outline';
import AppleLikeLoader from '@/components/AppleLikeLoader';

export interface Categoria {
  id: string;
  created_at: string;
  nome: string;
  descricao?: string | null;
}

export default function TabelaValoresPage() {
  const router = useRouter();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoriaParaEditar, setCategoriaParaEditar] = useState<Categoria | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [dadosOriginais, setDadosOriginais] = useState({});

  async function fetchCategorias() {
    setLoading(true);
    const { data, error } = await supabase
      .from('categorias_procedimentos')
      .select('*')
      .order('nome', { ascending: true });

    if (error) {
      console.error('Erro ao buscar categorias:', error);
      toast.error('Falha ao carregar categorias.');
    } else if (data) {
      setCategorias(data as Categoria[]);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchCategorias();
  }, []);

  const handleOpenModalParaNovaCategoria = () => {
    setCategoriaParaEditar(null);
    setIsModalOpen(true);
  };
  
  const handleOpenModalParaEditarCategoria = (categoria: Categoria) => {
    setCategoriaParaEditar(categoria);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCategoriaParaEditar(null);
  };

  const handleCategoriaSaved = () => {
    fetchCategorias(); 
    handleCloseModal();
  };
  
  const handleDeleteCategoria = async (categoriaId: string, categoriaNome: string) => {
    const confirmacao = window.confirm(`Tem certeza que deseja excluir a categoria "${categoriaNome}"? Todos os procedimentos associados a ela também podem ser afetados ou excluídos.`);
    if (confirmacao) {
      const { error } = await supabase
        .from('categorias_procedimentos')
        .delete()
        .eq('id', categoriaId);

      if (error) {
        if (error.message.includes('foreign key constraint')) {
             toast.error(`Erro ao excluir: Categoria "${categoriaNome}" está em uso por procedimentos e não pode ser excluída.`);
        } else {
            toast.error(`Erro ao excluir categoria: ${error.message}`);
        }
      } else {
        toast.success(`Categoria "${categoriaNome}" excluída com sucesso!`);
        fetchCategorias();
      }
    }
  };

  const handleAddCategoria = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Você precisa estar logado para realizar esta ação.');
      setIsSubmitting(false);
      return;
    }

    const categoriaData = {
      ...dadosOriginais,
      user_id: user.id,
      nome: nome.trim(),
      descricao: descricao.trim() || null
    };

    const { error } = await supabase
      .from('categorias_procedimentos')
      .insert([categoriaData]);

    setIsSubmitting(false);

    if (error) {
      toast.error(`Erro ao adicionar categoria: ${error.message}`);
    } else {
      toast.success('Categoria adicionada com sucesso!');
      fetchCategorias();
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center flex justify-center items-center min-h-[calc(100vh-100px)]">
        <AppleLikeLoader text="Carregando categorias..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gerenciar Tabela de Valores</h1>
          <p className="text-slate-600 text-sm mt-1">Visualize e gerencie todas as categorias de valores</p>
        </div>
        <Link
          href="/tabela-valores/categorias"
          className="inline-flex items-center px-6 py-3 rounded-xl shadow bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-semibold text-base focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all duration-200 ease-in-out transform hover:scale-105 hover:shadow-2xl"
        >
          <PlusCircleIcon className="h-6 w-6 mr-2" />
          Gerenciar Categorias
        </Link>
      </div>

      {categorias.length === 0 && !loading ? (
        <div className="text-center py-10">
          <p className="text-slate-500">Nenhuma categoria cadastrada ainda.</p>
          <p className="text-sm text-slate-400 mt-2">Clique em "Gerenciar Categorias" para começar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mt-8">
          {categorias.map((categoria) => (
            <Link href={`/tabela-valores/${categoria.id}`} key={categoria.id}>
              <div className="bg-white/60 backdrop-blur-xl shadow-lg rounded-2xl p-8 flex flex-col justify-center items-center transition-all duration-200 hover:shadow-2xl hover:-translate-y-1 border border-white/30 cursor-pointer min-h-[120px] h-32">
                <div className="relative w-full flex items-center justify-center h-full">
                  <h2 className="text-xl font-bold text-slate-900 text-center break-words w-full">
                    {categoria.nome}
                  </h2>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <CategoriaFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onCategoriaSaved={handleCategoriaSaved}
        categoriaParaEditar={categoriaParaEditar}
      />
    </div>
  );
}