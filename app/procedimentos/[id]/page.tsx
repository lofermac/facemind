'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';
import { toast } from 'sonner';
import { calcProcedureStatus } from '@/utils/statusRules';
import StatusBadge from '@/components/StatusBadge';
import { 
  ArrowLeftIcon, 
  PencilIcon, 
  CalendarDaysIcon,
  CurrencyDollarIcon,
  ClockIcon,
  TagIcon,
  UserIcon,
  BuildingOfficeIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import ImageModal from '@/components/ImageModal';

interface ProcedimentoDetalhes {
  id: string;
  paciente_id: string;
  procedimento_nome: string;
  data_procedimento: string;
  valor_cobrado: number | null;
  custo_produto: number | null;
  custo_insumos: number | null;
  custo_sala: number | null;
  categoria_nome: string | null;
  observacoes: string | null;
  fotos_antes_urls: string[] | null;
  fotos_depois_urls: string[] | null;
  procedimento_tabela_valores_id: {
    nome_procedimento: string;
    duracao_efeito_meses: number | null;
    categorias_procedimentos: {
      nome: string;
    } | null;
  } | null;
  pacientes: {
    nome: string;
    whatsapp: string | null;
    email: string | null;
  } | null;
}

export default function DetalhesProcedimentoPage() {
  const router = useRouter();
  const params = useParams();
  const procedimentoId = params && typeof params.id === 'string' ? params.id : '';

  const [procedimento, setProcedimento] = useState<ProcedimentoDetalhes | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imagemVisualizacao, setImagemVisualizacao] = useState<string | null>(null);

  useEffect(() => {
    if (procedimentoId) {
      const fetchProcedimento = async () => {
        setLoading(true);
        setNotFound(false);
        
        const { data, error } = await supabase
          .from('procedimentos_realizados')
          .select(`
            *,
            procedimento_tabela_valores_id (
              nome_procedimento,
              duracao_efeito_meses,
              categorias_procedimentos ( nome )
            ),
            pacientes (
              nome,
              whatsapp,
              email
            )
          `)
          .eq('id', procedimentoId)
          .single();

        if (error) {
          console.error('Erro ao buscar procedimento:', error);
          toast.error('Falha ao carregar dados do procedimento.');
          setNotFound(true);
        } else if (data) {
          console.log('Dados do procedimento carregados:', data);
          console.log('Fotos antes URLs:', data.fotos_antes_urls);
          console.log('Fotos depois URLs:', data.fotos_depois_urls);
          setProcedimento(data as ProcedimentoDetalhes);
        } else {
          setNotFound(true);
          toast.error('Procedimento não encontrado.');
        }
        setLoading(false);
      };
      
      fetchProcedimento();
    }
  }, [procedimentoId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Carregando detalhes...</p>
        </div>
      </div>
    );
  }

  if (notFound || !procedimento) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😞</div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Procedimento não encontrado</h1>
          <p className="text-slate-600 mb-4">O procedimento que você está procurando não existe.</p>
          <button
            onClick={() => router.push('/procedimentos')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Voltar aos Procedimentos
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const calcularLucro = () => {
    const receita = procedimento.valor_cobrado || 0;
    const custos = (procedimento.custo_produto || 0) + 
                   (procedimento.custo_insumos || 0) + 
                   (procedimento.custo_sala || 0);
    return receita - custos;
  };

  const openImageModal = (imageUrl: string) => {
    setImagemVisualizacao(imageUrl);
    setIsImageModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Carregando detalhes...</p>
        </div>
      </div>
    );
  }

  if (notFound || !procedimento) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😞</div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Procedimento não encontrado</h1>
          <p className="text-slate-600 mb-4">O procedimento que você está procurando não existe.</p>
          <button
            onClick={() => router.push('/procedimentos')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Voltar aos Procedimentos
          </button>
        </div>
      </div>
    );
  }

  const statusInfo = calcProcedureStatus(
    procedimento.data_procedimento,
    procedimento.procedimento_tabela_valores_id?.duracao_efeito_meses
  );

  const lucro = calcularLucro();

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors font-bold"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              Voltar
            </button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{procedimento.procedimento_nome}</h1>
              <p className="text-slate-600 mt-1 font-bold">Detalhes do Procedimento</p>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={statusInfo.status} dias={statusInfo.dias} />
              <button
                onClick={() => router.push(`/procedimentos/editar/${procedimento.id}`)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-bold"
              >
                <PencilIcon className="w-4 h-4" />
                Editar
              </button>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informações Principais */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informações Básicas */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-bold text-slate-800 mb-4">Informações Básicas</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <CalendarDaysIcon className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-slate-500">Data do Procedimento</p>
                    <p className="font-medium text-slate-800">{formatDate(procedimento.data_procedimento)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <TagIcon className="w-5 h-5 text-purple-500" />
                  <div>
                    <p className="text-sm text-slate-500">Categoria</p>
                    <p className="font-medium text-slate-800">
                      {procedimento.categoria_nome || 
                       procedimento.procedimento_tabela_valores_id?.categorias_procedimentos?.nome || 
                       'Não categorizado'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <ClockIcon className="w-5 h-5 text-amber-500" />
                  <div>
                    <p className="text-sm text-slate-500">Duração do Efeito</p>
                    <p className="font-medium text-slate-800">
                      {procedimento.procedimento_tabela_valores_id?.duracao_efeito_meses 
                        ? `${procedimento.procedimento_tabela_valores_id.duracao_efeito_meses} meses`
                        : '12 meses'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <UserIcon className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-sm text-slate-500">Paciente</p>
                    <p className="font-medium text-slate-800">{procedimento.pacientes?.nome || 'Não informado'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Observações */}
            {procedimento.observacoes && (
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h2 className="text-xl font-bold text-slate-800 mb-4">Observações</h2>
                <p className="text-slate-600 whitespace-pre-wrap">{procedimento.observacoes}</p>
              </div>
            )}

            {/* Galeria de Fotos */}
            {((procedimento.fotos_antes_urls && procedimento.fotos_antes_urls.length > 0) || 
              (procedimento.fotos_depois_urls && procedimento.fotos_depois_urls.length > 0)) && (
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <PhotoIcon className="w-5 h-5 text-purple-500" />
                  Galeria de Fotos
                </h2>
                
                <div className="space-y-6">
                  {/* Fotos Antes */}
                  {procedimento.fotos_antes_urls && procedimento.fotos_antes_urls.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-slate-700 mb-3 flex items-center gap-2">
                        <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                        Fotos Antes ({procedimento.fotos_antes_urls.length})
                      </h3>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3 p-4 border rounded-lg bg-slate-50">
                        {procedimento.fotos_antes_urls.map((rawUrl, index) => {
                          // Usar EXATAMENTE a mesma lógica do ProcedimentoForm que funciona
                          const corrigido = rawUrl
                            .replace('facemind-files.bunnycdn.com', 'facemind.b-cdn.net')
                            .replace('facemind-files.b-cdn.net', 'facemind.b-cdn.net');
                          const originalUrl = corrigido.split('?')[0];
                          
                          return (
                          <div 
                            key={index}
                            className="relative group"
                          >
                            <img
                              src={corrigido}
                              alt={`Foto antes ${index + 1}`}
                              className="w-full aspect-square object-cover rounded-lg border-2 border-white shadow-md cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200"
                              onClick={() => openImageModal(rawUrl)}
                              onLoad={(e) => {
                                console.log('✅ Imagem ANTES carregada:', corrigido);
                              }}
                              onError={(e) => {
                                console.error('❌ ERRO ao carregar foto antes:', corrigido);
                                const target = e.target as HTMLImageElement;
                                if (target.src !== originalUrl) {
                                  console.log('🔄 Tentando URL original:', originalUrl);
                                  target.src = originalUrl;
                                } else {
                                  console.error('💀 Falha total para:', rawUrl);
                                  target.style.display = 'none';
                                  const parent = target.parentElement;
                                  if (parent) {
                                    parent.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-slate-200 text-slate-500 text-xs">Imagem não encontrada</div>';
                                  }
                                }
                              }}
                            />
                          </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Fotos Depois */}
                  {procedimento.fotos_depois_urls && procedimento.fotos_depois_urls.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-slate-700 mb-3 flex items-center gap-2">
                        <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                        Fotos Depois ({procedimento.fotos_depois_urls.length})
                      </h3>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3 p-4 border rounded-lg bg-slate-50">
                        {procedimento.fotos_depois_urls.map((rawUrl, index) => {
                          // Usar EXATAMENTE a mesma lógica do ProcedimentoForm que funciona
                          const corrigido = rawUrl
                            .replace('facemind-files.bunnycdn.com', 'facemind.b-cdn.net')
                            .replace('facemind-files.b-cdn.net', 'facemind.b-cdn.net');
                          const originalUrl = corrigido.split('?')[0];
                          
                          return (
                          <div 
                            key={index}
                            className="relative group"
                          >
                            <img
                              src={corrigido}
                              alt={`Foto depois ${index + 1}`}
                              className="w-full aspect-square object-cover rounded-lg border-2 border-white shadow-md cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200"
                              onClick={() => openImageModal(rawUrl)}
                              onLoad={(e) => {
                                console.log('✅ Imagem DEPOIS carregada:', corrigido);
                              }}
                              onError={(e) => {
                                console.error('❌ ERRO ao carregar foto depois:', corrigido);
                                const target = e.target as HTMLImageElement;
                                if (target.src !== originalUrl) {
                                  console.log('🔄 Tentando URL original:', originalUrl);
                                  target.src = originalUrl;
                                } else {
                                  console.error('💀 Falha total para:', rawUrl);
                                  target.style.display = 'none';
                                  const parent = target.parentElement;
                                  if (parent) {
                                    parent.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-slate-200 text-slate-500 text-xs">Imagem não encontrada</div>';
                                  }
                                }
                              }}
                            />
                          </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Informações Financeiras */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <CurrencyDollarIcon className="w-5 h-5 text-green-500" />
                Informações Financeiras
              </h2>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-500">Valor Cobrado</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(procedimento.valor_cobrado)}</p>
                </div>

                <div className="border-t pt-4 space-y-3">
                  <h3 className="font-semibold text-slate-700">Custos</h3>
                  
                  <div className="flex justify-between">
                    <span className="text-slate-600">Produto:</span>
                    <span className="font-medium">{formatCurrency(procedimento.custo_produto)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-slate-600">Insumos:</span>
                    <span className="font-medium">{formatCurrency(procedimento.custo_insumos)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-slate-600">Sala:</span>
                    <span className="font-medium">{formatCurrency(procedimento.custo_sala)}</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-slate-700">Lucro:</span>
                    <span className={`text-2xl font-bold ${lucro >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(lucro)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contato do Paciente */}
            {procedimento.pacientes && (
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <UserIcon className="w-5 h-5 text-blue-500" />
                  Contato do Paciente
                </h2>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-slate-500">Nome</p>
                    <p className="font-medium text-slate-800">{procedimento.pacientes.nome}</p>
                  </div>
                  
                  {procedimento.pacientes.whatsapp && (
                    <div>
                      <p className="text-sm text-slate-500">WhatsApp</p>
                      <a 
                        href={`https://wa.me/+55${procedimento.pacientes.whatsapp.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-700 font-medium"
                      >
                        {procedimento.pacientes.whatsapp}
                      </a>
                    </div>
                  )}
                  
                  {procedimento.pacientes.email && (
                    <div>
                      <p className="text-sm text-slate-500">E-mail</p>
                      <a 
                        href={`mailto:${procedimento.pacientes.email}`}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        {procedimento.pacientes.email}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Imagem */}
      <ImageModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        imageUrl={imagemVisualizacao}
      />
    </div>
  );
}