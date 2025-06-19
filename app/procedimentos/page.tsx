// app/procedimentos/page.tsx
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { supabase } from '../../utils/supabaseClient'; // Ajuste se o seu utils estiver em outro lugar
import { toast } from 'sonner';
import { TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import { Dialog, Transition } from '@headlessui/react';
import '../styles/procedimentos.css';
import { useRouter, useSearchParams } from 'next/navigation';
import AppleLikeLoader from '@/components/AppleLikeLoader';
import dynamic from 'next/dynamic';

interface ProcedimentoRealizado {
  id: string;
  created_at: string;
  paciente_id: string;
  paciente_nome: string; 
  data_procedimento: string | null;
  categoria_nome: string | null;
  procedimento_nome: string | null;
  valor_cobrado: number | null;
  duracao_efeito_meses: number | null;
  status_calculado?: string;
}

function formatarDataLista(data: string | null): string {
  if (!data) return '-';
  return new Date(data).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

function formatarValor(valor: number | null): string {
  if (valor === null || valor === undefined) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
}

function calcularStatusProcedimento(
  dataProcedimento: string | null, 
  duracaoMeses: number | null
): { status: string; diasRestantes: number | null; cor: string; texto: string } {
  if (!dataProcedimento || !duracaoMeses || duracaoMeses <= 0) {
    return { status: 'sem_duracao', diasRestantes: null, cor: 'bg-gray-500', texto: 'Sem duração definida' };
  }

  const hojeUtc = new Date();
  hojeUtc.setUTCHours(0, 0, 0, 0);

  const dataRealizacao = new Date(dataProcedimento);
  dataRealizacao.setUTCHours(0, 0, 0, 0);

  const dataVencimento = new Date(dataRealizacao.getTime());
  dataVencimento.setUTCMonth(dataVencimento.getUTCMonth() + duracaoMeses);

  const diffDiasParaVencer = Math.floor((dataVencimento.getTime() - hojeUtc.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDiasParaVencer < 0) {
    return { 
      status: 'vencido', 
      diasRestantes: Math.abs(diffDiasParaVencer), 
      cor: 'bg-red-500', 
      texto: `Vencido há ${Math.abs(diffDiasParaVencer)} dias` 
    };
  } else if (diffDiasParaVencer <= 30) {
    return { 
      status: 'proximo_vencimento', 
      diasRestantes: diffDiasParaVencer, 
      cor: 'bg-yellow-500', 
      texto: `Vence em ${diffDiasParaVencer} dias` 
    };
  } else {
    return { 
      status: 'ativo', 
      diasRestantes: diffDiasParaVencer, 
      cor: 'bg-green-500', 
      texto: `Ativo (${diffDiasParaVencer} dias restantes)` 
    };
  }
}

function SeloStatus({ cor, texto }: { cor: string; texto: string }) {
  return (
    <div
      className={`absolute -top-4 right-4 z-20 px-5 py-1.5 rounded-full font-semibold text-sm shadow-lg border border-white/30 ${cor} flex items-center gap-2 backdrop-blur-xl bg-white/30 bg-clip-padding`} 
      style={{
        boxShadow: '0 2px 12px 0 rgba(30, 41, 59, 0.10)',
        letterSpacing: 0.2,
        minWidth: 0,
        maxWidth: '90%',
        transition: 'all 0.2s',
      }}
    >
      <span className="drop-shadow-sm text-slate-900" style={{color: cor.includes('green') ? '#059669' : cor.includes('yellow') ? '#b45309' : cor.includes('red') ? '#dc2626' : '#334155'}}>
        {texto}
      </span>
    </div>
  );
}

const ProcedimentosCardList = dynamic(() => import('./ProcedimentosCardList'), { ssr: false });

function ProcedimentosInner() {
  const searchParams = useSearchParams();
  const [procedimentos, setProcedimentos] = useState<ProcedimentoRealizado[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(() => {
    if (searchParams && typeof searchParams.get === 'function') {
      return searchParams.get('filtroNome') || '';
    }
    return '';
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [procedimentoParaExcluir, setProcedimentoParaExcluir] = useState<ProcedimentoRealizado | null>(null);
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [categorias, setCategorias] = useState<string[]>([]);
  const [mapaDuracaoProcedimentos, setMapaDuracaoProcedimentos] = useState<Map<string, number | null>>(new Map());
  const router = useRouter();

  async function fetchDuracoesProcedimentos() {
    try {
      const { data: tiposProcedimentoData, error: errorTipos } = await supabase
        .from('procedimentos_tabela_valores') 
        .select('nome_procedimento, duracao_efeito_meses');

      if (errorTipos) {
        console.error('Erro ao buscar durações dos tipos de procedimento:', errorTipos);
        return;
      }

      const novoMapaDuracao = new Map<string, number | null>();
      if (tiposProcedimentoData) {
        tiposProcedimentoData.forEach(tipo => {
          if (tipo.nome_procedimento) {
            novoMapaDuracao.set(String(tipo.nome_procedimento).toLowerCase(), tipo.duracao_efeito_meses as number | null);
          }
        });
      }
      setMapaDuracaoProcedimentos(novoMapaDuracao);
      console.log("Mapa de duração de procedimentos carregado:", novoMapaDuracao);
    } catch (error) {
      console.error('Erro ao buscar durações:', error);
    }
  }

  async function fetchProcedimentosComNomesPacientes() {
    setLoading(true);
    const { data: procedimentosData, error: procedimentosError } = await supabase
      .from('procedimentos_realizados')
      .select('*')
      .order('data_procedimento', { ascending: false });

    if (procedimentosError) {
      console.error('Erro ao buscar procedimentos:', procedimentosError);
      toast.error('Falha ao carregar procedimentos.');
      setLoading(false);
      return;
    }

    if (!procedimentosData || procedimentosData.length === 0) {
      setProcedimentos([]);
      setLoading(false);
      return;
    }

    const procedimentosComNomes: ProcedimentoRealizado[] = [];
    for (const proc of procedimentosData) {
      const { data: pacienteData, error: pacienteError } = await supabase
        .from('pacientes')
        .select('nome')
        .eq('id', proc.paciente_id)
        .single();

      if (pacienteError) {
        console.error(`Erro ao buscar paciente ${proc.paciente_id} para o procedimento ${proc.id}:`, pacienteError);
        procedimentosComNomes.push({
          ...proc,
          paciente_nome: 'Paciente não encontrado',
        } as ProcedimentoRealizado);
      } else if (pacienteData) {
        procedimentosComNomes.push({
          ...proc,
          paciente_nome: pacienteData.nome,
        } as ProcedimentoRealizado);
      } else {
         procedimentosComNomes.push({
          ...proc,
          paciente_nome: 'Informação indisponível',
        } as ProcedimentoRealizado);
      }
    }

    setProcedimentos(procedimentosComNomes);
    setLoading(false);
  }

  async function fetchCategorias() {
    const { data: categoriasData, error: categoriasError } = await supabase
      .from('categorias_procedimentos')
      .select('nome');

    if (categoriasError) {
      console.error('Erro ao buscar categorias:', categoriasError);
      toast.error('Falha ao carregar categorias.');
      return;
    }

    setCategorias(categoriasData.map(c => c.nome));
  }

  useEffect(() => {
    fetchDuracoesProcedimentos();
    fetchProcedimentosComNomesPacientes();
    fetchCategorias();
  }, []);

  const procedimentosFiltrados = procedimentos.filter(p => {
    const matchNome = searchTerm === '' || 
      (p.paciente_nome && p.paciente_nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.procedimento_nome && p.procedimento_nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.categoria_nome && p.categoria_nome.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchCategoria = categoriaFiltro === '' || p.categoria_nome === categoriaFiltro;
    return matchNome && matchCategoria;
  });

  const openModal = (proc: ProcedimentoRealizado) => {
    setProcedimentoParaExcluir(proc);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setProcedimentoParaExcluir(null);
  };

  const confirmDelete = async () => {
    if (procedimentoParaExcluir) {
      const { error } = await supabase
        .from('procedimentos_realizados')
        .delete()
        .eq('id', procedimentoParaExcluir.id);

      if (error) {
        console.error('Erro ao excluir procedimento:', error);
        toast.error(`Erro ao excluir: ${error.message}`);
      } else {
        toast.success('Procedimento excluído com sucesso!');
        fetchProcedimentosComNomesPacientes();
      }
      closeModal();
    }
  };

  if (loading && procedimentos.length === 0) {
    return (
      <div className="p-6 text-center flex justify-center items-center min-h-[calc(100vh-100px)]">
        <AppleLikeLoader text="Carregando dados dos procedimentos..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-3xl font-extrabold leading-9 text-slate-900 sm:text-4xl sm:truncate">
            Gerenciar Procedimentos
          </h2>
          <p className="mt-2 text-base text-slate-600">
            Visualize e gerencie todos os procedimentos realizados
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Link href="/procedimentos/novo" legacyBehavior>
            <a className="inline-flex items-center px-6 py-3 rounded-xl shadow bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-semibold text-base focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all duration-200 ease-in-out transform hover:scale-105 hover:shadow-2xl">
              + Novo Procedimento
            </a>
          </Link>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mb-6">
        <input 
          type="text" 
          placeholder="Buscar por Paciente, Procedimento ou Categoria" 
          className="bg-white/60 backdrop-blur-xl border border-white/30 shadow rounded-xl p-4 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 block w-full sm:text-base text-slate-700 placeholder-slate-400 transition-all duration-200"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select 
          className="bg-white/60 backdrop-blur-xl border border-white/30 shadow rounded-xl p-4 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 block w-full sm:w-1/4 sm:text-base text-slate-700 transition-all duration-200"
          value={categoriaFiltro}
          onChange={(e) => setCategoriaFiltro(e.target.value)}
        >
          <option value="">Todas as Categorias</option>
          {categorias.map((categoria) => (
            <option key={categoria} value={categoria}>{categoria}</option>
          ))}
        </select>
        <button 
          onClick={() => { setSearchTerm(''); setCategoriaFiltro(''); }}
          className="inline-flex items-center px-4 py-2 rounded-xl shadow bg-gradient-to-r from-slate-500 to-slate-700 hover:from-slate-600 hover:to-slate-800 text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 hover:shadow-2xl"
        >
          Limpar Filtros
        </button>
      </div>

      {/* Lista mobile */}
      <ProcedimentosCardList procedimentos={procedimentosFiltrados} />
      {/* Grid desktop */}
      <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {procedimentosFiltrados.map((proc) => {
          const chaveLookup = String(proc.procedimento_nome).toLowerCase();
          const duracaoMeses = mapaDuracaoProcedimentos.get(chaveLookup);
          const statusInfo = calcularStatusProcedimento(proc.data_procedimento, duracaoMeses || null);

          return (
            <div key={proc.id} className="relative bg-white/60 backdrop-blur-xl shadow-lg rounded-2xl p-6 transition-all duration-200 hover:shadow-2xl hover:-translate-y-1 border border-white/30">
              <SeloStatus cor={statusInfo.cor} texto={statusInfo.texto} />
              
              <div className="flex justify-between items-start mb-0">
                <div className="flex-1">
                  <h3 
                    className="text-lg font-bold text-slate-900 leading-tight mb-1 hover:text-blue-600 cursor-pointer transition-colors"
                    onClick={() => router.push(`/procedimentos/editar/${proc.id}`)}
                  >
                    {proc.procedimento_nome}
                  </h3>
                  <p className="text-base font-bold text-slate-700 mb-2">
                    {proc.categoria_nome}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      router.push(`/procedimentos/editar/${proc.id}`);
                    }} 
                    className="bg-white/60 backdrop-blur-md rounded-full p-2 shadow text-blue-600 hover:text-blue-800 hover:shadow-lg transition-all"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      openModal(proc);
                    }} 
                    className="bg-white/60 backdrop-blur-md rounded-full p-2 shadow text-red-600 hover:text-red-800 hover:shadow-lg transition-all"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1"><span className="font-bold">Nome:</span> {proc.paciente_nome}</p>
                <p className="text-sm text-slate-600 mb-1"><span className="font-bold">Data:</span> {formatarDataLista(proc.data_procedimento)}</p>
                <p className="text-sm text-slate-600"><span className="font-bold">Valor:</span> {formatarValor(proc.valor_cobrado)}</p>
                {duracaoMeses && (
                  <p className="text-sm text-slate-600 mt-1">
                    <span className="font-bold">Duração:</span> {duracaoMeses} {duracaoMeses === 1 ? 'mês' : 'meses'}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Transition.Root show={isModalOpen} as={React.Fragment}>
        <Dialog as="div" className="fixed inset-0 z-10 overflow-y-auto" onClose={closeModal}>
          <div className="flex min-h-screen items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm transition-opacity" />
            </Transition.Child>

            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <div className="relative transform overflow-hidden rounded-2xl bg-white/90 backdrop-blur-xl px-6 pb-6 pt-7 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <Dialog.Title as="h3" className="text-2xl font-bold leading-6 text-slate-900 mb-2">
                      Confirmar Exclusão
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-base text-slate-700">
                        Tem certeza que deseja excluir o procedimento &quot;{procedimentoParaExcluir?.procedimento_nome}&quot;? Esta ação não pode ser desfeita.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-red-600 px-4 py-2 text-base font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                    onClick={confirmDelete}
                  >
                    Excluir
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-slate-200 px-4 py-2 text-base font-semibold text-slate-800 shadow-sm hover:bg-slate-300 sm:mt-0 sm:w-auto"
                    onClick={closeModal}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
    </div>
  );
}

export default function ListarProcedimentosPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Carregando...</div>}>
      <ProcedimentosInner />
    </Suspense>
  );
}