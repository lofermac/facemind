'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { toast } from 'sonner';
import { 
  CloudArrowUpIcon, 
  DocumentIcon, 
  TrashIcon,
  EyeIcon,
  ArrowDownTrayIcon 
} from '@heroicons/react/24/outline';

interface DocumentoPaciente {
  id: string;
  paciente_id: string;
  user_id: string;
  nome_arquivo: string;
  url_arquivo: string;
  tipo_arquivo: string | null;
  tamanho_arquivo: number | null;
  data_upload: string;
  descricao: string | null;
}

interface DocumentosUploadProps {
  pacienteId: string;
  pacienteNome: string;
}

export default function DocumentosUpload({ pacienteId, pacienteNome }: DocumentosUploadProps) {
  const [documentos, setDocumentos] = useState<DocumentoPaciente[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [documentoParaExcluir, setDocumentoParaExcluir] = useState<DocumentoPaciente | null>(null);

  // Buscar documentos do paciente
  const fetchDocumentos = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('documentos_pacientes')
        .select('*')
        .eq('paciente_id', pacienteId)
        .order('data_upload', { ascending: false });

      if (error) throw error;
      setDocumentos(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar documentos:', error);
      toast.error('Erro ao carregar documentos: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [pacienteId]);

  useEffect(() => {
    fetchDocumentos();
  }, [fetchDocumentos]);

  // Upload de arquivo
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;

    const file = event.target.files[0];
    
    // Validações
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error('Arquivo muito grande. Máximo: 10MB');
      return;
    }

    setUploading(true);

    try {
      // Upload para Bunny CDN
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const timestamp = Date.now();
      const novoNome = `documentos/${pacienteId}/${timestamp}_${sanitizedFileName}`;

      const formData = new FormData();
      const renamedFile = new File([file], novoNome, { type: file.type });
      formData.append('file', renamedFile);

      console.log('Enviando documento para Bunny CDN:', novoNome);
      
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      const uploadData = await uploadRes.json();
      console.log('Resposta API upload:', uploadData);

      if (!uploadData.url) {
        throw new Error(uploadData.error || 'Falha no upload.');
      }

      // Obter usuário atual
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) {
        throw new Error('Usuário não autenticado.');
      }

      // Salvar no banco de dados
      const { error: insertError } = await supabase
        .from('documentos_pacientes')
        .insert([{
          paciente_id: pacienteId,
          user_id: userData.user.id,
          nome_arquivo: sanitizedFileName,
          url_arquivo: uploadData.url,
          tipo_arquivo: file.type,
          tamanho_arquivo: file.size,
          descricao: null
        }]);

      if (insertError) throw insertError;

      toast.success('Documento enviado com sucesso!');
      fetchDocumentos();
      
      // Limpar input
      event.target.value = '';
      
    } catch (error: any) {
      console.error('Erro ao enviar documento:', error);
      toast.error('Erro ao enviar documento: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  // Abrir modal de confirmação de exclusão
  const handleDeleteDocumento = (documento: DocumentoPaciente) => {
    setDocumentoParaExcluir(documento);
    setShowDeleteModal(true);
  };

  // Confirmar exclusão do documento
  const confirmarExclusao = async () => {
    if (!documentoParaExcluir) return;

    try {
      const { error } = await supabase
        .from('documentos_pacientes')
        .delete()
        .eq('id', documentoParaExcluir.id);

      if (error) throw error;

      toast.success('Documento excluído com sucesso!');
      fetchDocumentos();
      setShowDeleteModal(false);
      setDocumentoParaExcluir(null);
    } catch (error: any) {
      console.error('Erro ao excluir documento:', error);
      toast.error('Erro ao excluir documento: ' + error.message);
    }
  };

  // Cancelar exclusão
  const cancelarExclusao = () => {
    setShowDeleteModal(false);
    setDocumentoParaExcluir(null);
  };

  // Formatar tamanho do arquivo
  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'N/A';
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Formatar data
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Obter ícone do tipo de arquivo
  const getFileIcon = (tipoArquivo: string | null) => {
    if (!tipoArquivo) return DocumentIcon;
    
    if (tipoArquivo.includes('pdf')) return DocumentIcon;
    if (tipoArquivo.includes('image')) return DocumentIcon;
    if (tipoArquivo.includes('word')) return DocumentIcon;
    
    return DocumentIcon;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-slate-600">Carregando documentos...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            Documentos de {pacienteNome}
          </h3>
          <p className="text-sm text-slate-600">
            {documentos.length} documento(s) enviado(s)
          </p>
        </div>
      </div>

      {/* Upload Area */}
      <label 
        htmlFor="file-upload" 
        className="block border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors cursor-pointer"
      >
        <CloudArrowUpIcon className="mx-auto h-12 w-12 text-slate-400" />
        <div className="mt-4">
          <span className="mt-2 block text-sm font-medium text-slate-900">
            {uploading ? 'Enviando...' : 'Clique para enviar um documento'}
          </span>
          <span className="mt-1 block text-xs text-slate-500">
            PDF, DOC, DOCX, JPG, PNG (máx. 10MB)
          </span>
        </div>
        
        {uploading && (
          <div className="mt-4">
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          </div>
        )}
        
        <input
          id="file-upload"
          name="file-upload"
          type="file"
          className="sr-only"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          onChange={handleFileUpload}
          disabled={uploading}
        />
      </label>

      {/* Lista de Documentos */}
      {documentos.length === 0 ? (
        <div className="text-center py-8">
          <DocumentIcon className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-2 text-sm font-medium text-slate-900">Nenhum documento</h3>
          <p className="mt-1 text-sm text-slate-500">
            Faça o upload do primeiro documento para este paciente.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h4 className="text-sm font-medium text-slate-900">Documentos Enviados</h4>
          </div>
          
          <div className="divide-y divide-slate-200">
            {documentos.map((documento) => {
              const FileIcon = getFileIcon(documento.tipo_arquivo);
              
              return (
                <div key={documento.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50">
                  <div className="flex items-center min-w-0 flex-1">
                    <FileIcon className="h-8 w-8 text-blue-500 flex-shrink-0" />
                    <div className="ml-4 min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {documento.nome_arquivo}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-slate-500">
                        <span>{formatFileSize(documento.tamanho_arquivo)}</span>
                        <span>{formatDate(documento.data_upload)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => window.open(documento.url_arquivo, '_blank')}
                      className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Visualizar documento"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    
                    <a
                      href={documento.url_arquivo}
                      download={documento.nome_arquivo}
                      className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                      title="Baixar documento"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4" />
                    </a>
                    
                    <button
                      onClick={() => handleDeleteDocumento(documento)}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                      title="Excluir documento"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl border border-slate-300 pointer-events-auto">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <TrashIcon className="h-6 w-6 text-red-600" />
              </div>
              
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Excluir Documento
              </h3>
              
              <p className="text-sm text-slate-600 mb-6">
                Tem certeza que deseja excluir "{documentoParaExcluir?.nome_arquivo}"?
                <br />
                <span className="text-red-600 font-medium">Esta ação não pode ser desfeita.</span>
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={cancelarExclusao}
                  className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 border border-slate-300 rounded-lg hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-500 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarExclusao}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
