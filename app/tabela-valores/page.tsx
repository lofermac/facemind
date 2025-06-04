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

  if (loading) {
    return (
      <div className="p-6 text-center flex justify-center items-center min-h-[calc(100vh-100px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-sky-500 mr-3"></div>
        Carregando categorias...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-[2rem] font-extrabold text-gray-900">Gerenciar Tabela de Valores</h1>
          <p className="text-[1.125rem] text-gray-600 mt-1">Visualize e gerencie todas as categorias de valores</p>
        </div>
        <Link
          href="/tabela-valores/categorias"
          className="inline-flex items-center px-5 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg cursor-pointer"
        >
          <PlusCircleIcon className="h-5 w-5 mr-2" />
          Gerenciar Categorias
        </Link>
      </div>

      {categorias.length === 0 && !loading ? (
        <div className="text-center py-10">
          <p className="text-gray-500">Nenhuma categoria cadastrada ainda.</p>
          <p className="text-sm text-gray-400 mt-2">Clique em "Gerenciar Categorias" para começar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
          {categorias.map((categoria) => (
            <Link href={`/tabela-valores/${categoria.id}`} key={categoria.id}>
              <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col justify-between transition-transform transform hover:scale-105 hover:shadow-lg">
                <div className="relative">
                  <h2 className="text-lg font-bold text-gray-800 text-center">
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