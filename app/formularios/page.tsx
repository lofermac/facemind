'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { PlusCircleIcon, EyeIcon, ArrowDownTrayIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { supabase } from '@/utils/supabaseClient';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface FormCategory {
  id: string;
  name: string;
  description: string | null;
}

interface FormFile {
  id: string;
  category_id: string;
  file_name: string;
  file_url: string;
}

export default function FormulariosPage() {
  const [categories, setCategories] = useState<FormCategory[]>([]);
  const [files, setFiles] = useState<FormFile[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchCategoriesAndFiles = useCallback(async () => {
    setLoading(true);
    try {
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('form_categories')
        .select('*');

      if (categoriesError) throw categoriesError;
      setCategories(categoriesData || []);

      if (selectedCategory) {
        const { data: filesData, error: filesError } = await supabase
          .from('form_files')
          .select('*')
          .eq('category_id', selectedCategory);

        if (filesError) throw filesError;
        setFiles(filesData || []);
      }
    } catch (error: any) {
      toast.error('Erro ao carregar dados: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchCategoriesAndFiles();
  }, [fetchCategoriesAndFiles]);

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    // Lógica para upload de arquivos
  };

  if (loading) {
    return (
      <div className="p-6 text-center flex justify-center items-center min-h-[calc(100vh-100px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-sky-500 mr-3"></div>
        Carregando dados dos formulários...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-[2rem] font-extrabold text-gray-900">Gerenciar Formulários</h1>
          <p className="text-[1.125rem] text-gray-600 mt-1">Visualize e gerencie todos os formulários disponíveis</p>
        </div>
        <button
          onClick={() => router.push('/formularios/modelos')}
          className="inline-flex items-center px-5 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg cursor-pointer"
        >
          <PlusCircleIcon className="h-5 w-5 mr-2" />
          Gerenciar Categorias
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mt-8">
        {categories.map(category => (
          <Link href={`/formularios/${category.id}`} key={category.id}>
            <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col justify-between transition-transform transform hover:scale-105 hover:shadow-lg cursor-pointer">
              <div className="relative">
                <h2 className="text-lg font-bold text-gray-800 text-center">
                  {category.name}
                </h2>
              </div>
            </div>
          </Link>
        ))}
      </div>
      {selectedCategory && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold text-slate-700 mb-4">Arquivos da Categoria</h2>
          <ul role="list" className="divide-y divide-slate-200">
            {files.map(file => (
              <li key={file.id} className="p-4 flex justify-between items-center">
                <span>{file.file_name}</span>
                <div className="flex space-x-2">
                  <a href={file.file_url} target="_blank" rel="noopener noreferrer" className="text-green-500 hover:text-green-700">
                    <EyeIcon className="h-5 w-5" />
                  </a>
                  <button className="text-blue-500 hover:text-blue-700">
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button className="text-red-500 hover:text-red-700">
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 