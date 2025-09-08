'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { PlusCircleIcon, EyeIcon, ArrowDownTrayIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { supabase } from '@/utils/supabaseClient';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import AppleLikeLoader from '@/components/AppleLikeLoader';

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
        <AppleLikeLoader />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gerenciar Formulários</h1>
          <p className="text-slate-600 text-sm mt-1">Visualize e gerencie todos os formulários disponíveis</p>
        </div>
        <button
          onClick={() => router.push('/formularios/modelos')}
          className="inline-flex items-center px-6 py-3 rounded-xl shadow bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-semibold text-base focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all duration-200 ease-in-out transform hover:scale-105 hover:shadow-2xl"
        >
          <PlusCircleIcon className="h-6 w-6 mr-2" />
          Gerenciar Categorias
        </button>
      </div>
      <div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 mt-8"
        style={{ gridAutoRows: '1fr' }}
      >
        {categories.map(category => (
          <Link href={`/formularios/${category.id}`} key={category.id}>
            <div className="bg-white/60 backdrop-blur-xl shadow-lg rounded-2xl p-8 flex flex-col justify-center items-center transition-all duration-200 hover:shadow-2xl hover:-translate-y-1 border border-white/30 cursor-pointer h-full">
              <div className="relative">
                <h2 className="text-xl font-bold text-slate-900 text-center">
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
          <ul role="list" className="divide-y divide-slate-200 bg-white/60 backdrop-blur-xl rounded-xl shadow border border-white/30">
            {files.map(file => (
              <li key={file.id} className="p-4 flex justify-between items-center">
                <span className="text-slate-800 font-medium">{file.file_name}</span>
                <div className="flex space-x-2">
                  <a href={file.file_url} target="_blank" rel="noopener noreferrer" className="w-9 h-9 flex items-center justify-center rounded-full bg-white/40 backdrop-blur-md shadow text-green-500 hover:text-green-700 hover:shadow-lg transition-all">
                    <EyeIcon className="h-5 w-5" />
                  </a>
                  <button className="w-9 h-9 flex items-center justify-center rounded-full bg-white/40 backdrop-blur-md shadow text-blue-500 hover:text-blue-700 hover:shadow-lg transition-all">
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button className="w-9 h-9 flex items-center justify-center rounded-full bg-white/40 backdrop-blur-md shadow text-red-500 hover:text-red-700 hover:shadow-lg transition-all">
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