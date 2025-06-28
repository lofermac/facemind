"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';
import { toast } from 'sonner';
import { PlusCircleIcon, EyeIcon, ArrowDownTrayIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface FormFile {
  id: string;
  category_id: string;
  file_name: string;
  file_url: string;
}

export default function CategoriaFilesPage() {
  const router = useRouter();
  const { categoryId } = useParams() as { categoryId?: string };
  const [files, setFiles] = useState<FormFile[]>([]);
  const [loading, setLoading] = useState(true);

  if (!categoryId) {
    toast.error('Categoria inválida.');
    return;
  }

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('form_files')
        .select('*')
        .eq('category_id', categoryId);

      if (error) throw error;
      setFiles(data || []);
    } catch (error: any) {
      toast.error('Erro ao carregar arquivos: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;

    const file = event.target.files[0];
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const novoNome = `${Date.now()}_${sanitizedFileName}`;

    try {
      console.log('Enviando arquivo para API upload:', novoNome);
      const formData = new FormData();
      const renamedFile = new File([file], novoNome, { type: file.type });
      formData.append('file', renamedFile);

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const uploadData = await uploadRes.json();
      console.log('Resposta API /api/upload (formularios):', uploadData);

      if (!uploadData.url) {
        throw new Error(uploadData.error || 'Falha no upload.');
      }

      const publicURL = uploadData.url as string;
      console.log('URL pública obtida:', publicURL);

      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData) {
        toast.error('Usuário não autenticado.');
        return;
      }

      const { error: insertError } = await supabase
        .from('form_files')
        .insert([{ category_id: categoryId, file_name: renamedFile.name, file_url: publicURL, user_id: userData.user.id }]);

      if (insertError) {
        console.error('Erro ao inserir no banco:', insertError.message);
        throw insertError;
      }

      toast.success('Arquivo enviado com sucesso!');
      fetchFiles();
    } catch (error: any) {
      console.error('Erro ao enviar arquivo:', error.message);
      toast.error('Erro ao enviar arquivo: ' + error.message);
    }
  };

  const normalizeUrl = (url: string) => {
    return url
      .replace('facemind-files.bunnycdn.com', 'facemind.b-cdn.net')
      .replace('facemind-files.b-cdn.net', 'facemind.b-cdn.net');
  };

  const handleViewFile = (fileUrl: string) => {
    window.open(normalizeUrl(fileUrl), '_blank');
  };

  const handleEditFile = (fileId: string) => {
    console.log(`Editar arquivo com ID: ${fileId}`);
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      const { error } = await supabase
        .from('form_files')
        .delete()
        .eq('id', fileId);

      if (error) throw error;

      toast.success('Arquivo excluído com sucesso!');
      fetchFiles();
    } catch (error: any) {
      console.error('Erro ao excluir arquivo:', error.message);
      toast.error('Erro ao excluir arquivo: ' + error.message);
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Arquivos da Categoria</h1>
        <button
          onClick={() => document.getElementById('fileInput')?.click()}
          className="bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md flex items-center"
        >
          <PlusCircleIcon className="h-5 w-5 mr-2" />
          Novo Arquivo
        </button>
        <input
          type="file"
          id="fileInput"
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {files.map(file => (
          <div key={file.id} className="bg-white p-6 rounded-lg shadow-lg flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-800">{file.file_name}</h2>
            </div>
            <div className="flex justify-end space-x-4 mt-4">
              <button className="text-blue-600 hover:text-blue-800" onClick={() => handleViewFile(file.file_url)}>
                <EyeIcon className="h-6 w-6" />
              </button>
              <button className="text-green-600 hover:text-green-800" onClick={() => handleEditFile(file.id)}>
                <PencilIcon className="h-6 w-6" />
              </button>
              <button className="text-red-600 hover:text-red-800" onClick={() => handleDeleteFile(file.id)}>
                <TrashIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 