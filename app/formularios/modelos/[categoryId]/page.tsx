// app/formularios/modelos/[categoryId]/page.tsx
'use client';

import React, { useState, useEffect, useCallback, ChangeEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/utils/supabaseClient';
import { toast } from 'sonner';
import { 
    ArrowLeftIcon, DocumentPlusIcon, DocumentArrowDownIcon, 
    TrashIcon, EyeIcon, DocumentTextIcon 
} from '@heroicons/react/24/outline';

interface FormTemplate {
  id: string;
  category_id: string;
  template_name: string;
  file_name_original: string;
  storage_file_path: string; 
  file_mime_type: string | null;
  file_size_bytes: number | null;
  description: string | null;
  uploaded_at: string; 
}

interface CategoryInfo {
  id: string;
  name: string;
}

const NOME_DO_BUCKET_PARA_MODELOS = 'facemind-document-templates'; 

export default function CategoriaTemplatesPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = params.categoryId as string;

  const [categoryInfo, setCategoryInfo] = useState<CategoryInfo | null>(null);
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [loading, setLoading] = useState(true); // Estado de loading principal da página
  
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false); // Estado de loading específico para o upload

  const fetchCategoryDetailsAndTemplates = useCallback(async () => {
    if (!categoryId) return;
    setLoading(true); // Ativa loading geral
    try {
      const { data: categoryData, error: categoryError } = await supabase
        .from('form_categories')
        .select('id, name')
        .eq('id', categoryId)
        .single();

      if (categoryError) throw categoryError;
      if (categoryData) setCategoryInfo(categoryData);
      else {
        toast.error('Categoria de formulários não encontrada.');
        router.push('/formularios/modelos'); 
        return;
      }

      const { data: templatesData, error: templatesError } = await supabase
        .from('form_templates')
        .select('*')
        .eq('category_id', categoryId)
        .order('template_name', { ascending: true });
      
      if (templatesError) throw templatesError;
      if (templatesData) setTemplates(templatesData as FormTemplate[]);

    } catch (error: any) {
      toast.error('Erro ao carregar dados da categoria: ' + error.message);
      console.error("Erro em fetchCategoryDetailsAndTemplates:", error);
    } finally {
      setLoading(false); // Desativa loading geral
    }
  }, [categoryId, router]);

  useEffect(() => {
    fetchCategoryDetailsAndTemplates();
  }, [fetchCategoryDetailsAndTemplates]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setFileToUpload(file);
      if (!templateName) { 
        setTemplateName(file.name.substring(0, file.name.lastIndexOf('.')) || file.name);
      }
    }
  };

  const handleUploadSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!fileToUpload || !templateName.trim()) {
      toast.error('Nome do modelo e arquivo são obrigatórios.');
      return;
    }

    setIsUploading(true); // Ativa loading do formulário de upload
    try {
      const fileExt = fileToUpload.name.split('.').pop()?.toLowerCase() || 'file';
      const cleanTemplateName = templateName.trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_.-]/g, '');
      const storagePath = `${categoryId}/${cleanTemplateName}_${Date.now()}.${fileExt}`;
      
      console.log('Iniciando upload do arquivo:', fileToUpload.name);
      console.log('Caminho de armazenamento gerado:', storagePath);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(NOME_DO_BUCKET_PARA_MODELOS) 
        .upload(storagePath, fileToUpload, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;
      if (!uploadData) throw new Error('Falha no upload, dados de retorno do storage vazios.');
      console.log('Upload realizado com sucesso, caminho do arquivo:', uploadData.path);

      const newTemplateData = {
        category_id: categoryId,
        template_name: templateName.trim(),
        file_name_original: fileToUpload.name,
        storage_file_path: uploadData.path, 
        file_mime_type: fileToUpload.type,
        file_size_bytes: fileToUpload.size,
        description: templateDescription.trim() || null,
      };

      console.log('Dados do novo template:', newTemplateData);

      const { error: insertError } = await supabase
        .from('form_templates')
        .insert(newTemplateData);

      if (insertError) throw insertError;

      toast.success(`Modelo "${templateName.trim()}" enviado com sucesso!`);
      setShowUploadForm(false);
      setFileToUpload(null);
      setTemplateName('');
      setTemplateDescription('');
      const fileInput = document.getElementById('fileUpload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      fetchCategoryDetailsAndTemplates(); 

    } catch (error: any) {
      toast.error('Falha no upload do modelo: ' + error.message);
      console.error('Erro no upload:', error);
    } finally {
      setIsUploading(false); // Desativa loading do formulário de upload
    }
  };

  const handleDeleteTemplate = async (template: FormTemplate) => {
    if (window.confirm(`Tem certeza que deseja excluir o modelo "${template.template_name}"?`)) {
      setLoading(true); // CORRIGIDO: Usa setLoading para o feedback visual durante a deleção
      try {
        const { error: storageError } = await supabase.storage
          .from(NOME_DO_BUCKET_PARA_MODELOS) 
          .remove([template.storage_file_path]);
        
        if (storageError && storageError.message !== 'The resource was not found') { 
          // CORRIGIDO: Usa toast.warning
          toast.warning(`Aviso: Arquivo no storage pode não ter sido deletado: ${storageError.message}.`);
        }

        const { error: dbError } = await supabase
          .from('form_templates')
          .delete()
          .eq('id', template.id);
        if (dbError) throw dbError;

        toast.success(`Modelo "${template.template_name}" deletado com sucesso.`);
        fetchCategoryDetailsAndTemplates();
      } catch (error: any) {
        toast.error('Falha ao deletar modelo: ' + error.message);
      } finally {
        setLoading(false); // CORRIGIDO: Usa setLoading para desativar o feedback visual
      }
    }
  };

  const getPublicFileUrl = (filePath: string): string => {
    const { data } = supabase.storage.from(NOME_DO_BUCKET_PARA_MODELOS).getPublicUrl(filePath); 
    return data?.publicUrl || '#';
  };

  // --- JSX da página (sem alterações na estrutura, apenas nas correções acima) ---
  if (loading && !categoryInfo && templates.length === 0) {
    return (
      <div className="p-6 text-center flex justify-center items-center min-h-[calc(100vh-100px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-sky-500 mr-3"></div>
        Carregando dados da categoria...
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8">
        <Link href="/formularios/modelos" className="inline-flex items-center text-sky-600 hover:text-sky-800 transition-colors duration-150 text-sm font-medium">
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Voltar para Todas as Categorias
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8 pb-4 border-b border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
          Modelos em: <span className="text-sky-600">{categoryInfo?.name || (categoryId && !loading ? 'Categoria não encontrada' : 'Carregando...')}</span>
        </h1>
        <button
          onClick={() => {
            setShowUploadForm(!showUploadForm);
            if (!showUploadForm) {
                setFileToUpload(null);
                setTemplateName('');
                setTemplateDescription('');
                const fileInput = document.getElementById('fileUpload') as HTMLInputElement;
                if (fileInput) fileInput.value = '';
            }
          }}
          className="mt-4 sm:mt-0 bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition duration-150 ease-in-out flex items-center"
        >
          <DocumentPlusIcon className="h-5 w-5 mr-2" />
          {showUploadForm ? 'Cancelar Upload' : 'Adicionar Novo Modelo'}
        </button>
      </div>

      {showUploadForm && (
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-xl mb-8 border border-slate-200">
          <h2 className="text-xl font-semibold text-slate-700 mb-5">Adicionar Novo Modelo de Formulário</h2>
          <form onSubmit={handleUploadSubmit} className="space-y-4">
            <div>
              <label htmlFor="templateName" className="block text-sm font-medium text-slate-700">
                Nome do Modelo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="templateName"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="templateDescription" className="block text-sm font-medium text-slate-700">
                Descrição (Opcional)
              </label>
              <textarea
                id="templateDescription"
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                rows={3}
                className="mt-1 block w-full px-4 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="fileUpload" className="block text-sm font-medium text-slate-700">
                Arquivo do Modelo <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                id="fileUpload"
                onChange={handleFileChange}
                className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-sky-100 file:text-sky-700 hover:file:bg-sky-200 cursor-pointer"
                required
              />
              {fileToUpload && <p className="text-xs text-slate-500 mt-1">Selecionado: {fileToUpload.name} ({(fileToUpload.size / 1024).toFixed(1)} KB)</p>}
            </div>
            <div className="flex justify-end space-x-3 pt-3">
              <button
                type="button"
                onClick={() => setShowUploadForm(false)}
                disabled={isUploading}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isUploading || isUploading} // Mantido isUploading, o segundo é redundante
                className="bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-4 rounded-md shadow-sm text-sm disabled:opacity-70 flex items-center"
              >
                {isUploading && <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>}
                {isUploading ? 'Enviando...' : 'Salvar Modelo'}
              </button>
            </div>
          </form>
        </div>
      )}

      {(loading && templates.length === 0 && !categoryInfo) && !showUploadForm && ( // Ajustado para mostrar loading se categoryInfo ainda não carregou
         <p className="text-slate-500 text-center py-8">Carregando modelos...</p>
      )}

      {(!loading && templates.length === 0 && !showUploadForm) && (
        <div className="text-center bg-white p-8 sm:p-12 rounded-xl shadow-lg border border-slate-200">
          <DocumentTextIcon className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 text-xl font-medium">Nenhum modelo de formulário nesta categoria ainda.</p>
          <p className="text-slate-500 mt-2">Clique em "Adicionar Novo Modelo" para começar.</p>
        </div>
      )}

      {templates.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          <ul role="list" className="divide-y divide-slate-200">
            {templates.map((template) => (
              <li key={template.id} className="px-4 py-4 sm:px-6 hover:bg-slate-50/70 transition-colors">
                <div className="flex items-center justify-between space-x-4">
                  <DocumentTextIcon className="h-8 w-8 text-sky-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-md font-semibold text-slate-800 truncate" title={template.template_name}>{template.template_name}</p>
                    {template.description && (
                      <p className="text-sm text-slate-500 truncate" title={template.description}>{template.description}</p>
                    )}
                    <p className="text-xs text-slate-400 mt-1">
                      Arquivo: {template.file_name_original} 
                      {template.file_size_bytes && ` (${(template.file_size_bytes / (1024*1024)).toFixed(2)} MB)`}
                       - Upload: {new Date(template.uploaded_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex-shrink-0 flex items-center space-x-1 sm:space-x-2">
                    <a 
                      href={getPublicFileUrl(template.storage_file_path)}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2 rounded-md text-slate-500 hover:text-sky-700 hover:bg-sky-100 transition-colors" 
                      title="Ver/Baixar Modelo"
                    >
                      <DocumentArrowDownIcon className="h-5 w-5"/>
                    </a>
                    <button 
                        onClick={() => handleDeleteTemplate(template)}
                        className="p-2 rounded-md text-slate-500 hover:text-red-700 hover:bg-red-100 transition-colors" 
                        title="Excluir Modelo">
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