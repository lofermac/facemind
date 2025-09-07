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
import SkeletonLoader from '@/components/SkeletonLoader';
import ErrorBoundary from '@/components/ErrorBoundary';
import dynamic from 'next/dynamic';
import { CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/solid';
import StatusBadge from '@/components/StatusBadge';
import { calcProcedureStatus, normalizeText } from '@/utils/statusRules';
import { useRef } from 'react';

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
  const { status, dias } = calcProcedureStatus(dataProcedimento, duracaoMeses);
  if (status === 'vencido') return { status, diasRestantes: dias, cor: 'bg-red-500', texto: `Vencido há ${dias} dias` };
  if (status === 'proximo_vencimento') return { status, diasRestantes: dias, cor: 'bg-yellow-500', texto: `Vence em ${dias} dias` };
  if (status === 'ativo') return { status, diasRestantes: dias, cor: 'bg-green-500', texto: `Ativo (${dias} dias restantes)` };
  return { status: 'sem_duracao', diasRestantes: null, cor: 'bg-gray-500', texto: 'Sem duração definida' };
}

// Função auxiliar para status Renovado
function statusRenovado() {
  return { status: 'renovado', diasRestantes: null, cor: 'bg-blue-500', texto: 'Renovado' };
}

function SeloStatus({ status, diasRestantes }: { status: string; diasRestantes?: number | null }) {
  return (
    <div className="absolute -top-4 right-4 z-20">
      <StatusBadge status={status as any} dias={diasRestantes ?? undefined} />
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
  const [filtroStatusURL, setFiltroStatusURL] = useState<string>(() => {
    if (searchParams && typeof searchParams.get === 'function') {
      return searchParams.get('filtroStatus') || '';
    }
    return '';
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [procedimentoParaExcluir, setProcedimentoParaExcluir] = useState<ProcedimentoRealizado | null>(null);
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [categorias, setCategorias] = useState<string[]>([]);
  const [mapaDuracaoProcedimentos, setMapaDuracaoProcedimentos] = useState<Map<string, number | null>>(new Map());
  const router = useRouter();
  const [dropdownAberto, setDropdownAberto] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownAberto(false);
      }
    }
    function handleEsc(event: KeyboardEvent) {
      if (event.key === 'Escape') setDropdownAberto(false);
    }
    if (dropdownAberto) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEsc);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [dropdownAberto]);

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
      .select('id, created_at, paciente_id, data_procedimento, categoria_nome, valor_cobrado, procedimento_tabela_valores_id ( nome_procedimento, duracao_efeito_meses )')
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

      // Normaliza o retorno do join: pode vir como objeto ou como array dependendo do tipo gerado
      const tvRaw: any = (proc as any).procedimento_tabela_valores_id ?? null;
      let procedimento_nome = '';
      let duracao_efeito_meses: number | null = null;
      if (tvRaw) {
        if (Array.isArray(tvRaw)) {
          const first = tvRaw[0] ?? null;
          if (first) {
            procedimento_nome = first.nome_procedimento ?? '';
            duracao_efeito_meses = (first.duracao_efeito_meses ?? null) as number | null;
          }
        } else {
          procedimento_nome = tvRaw.nome_procedimento ?? '';
          duracao_efeito_meses = (tvRaw.duracao_efeito_meses ?? null) as number | null;
        }
      }

      if (pacienteError) {
        procedimentosComNomes.push({
          ...proc,
          procedimento_nome,
          duracao_efeito_meses,
          paciente_nome: 'Paciente não encontrado',
        } as ProcedimentoRealizado);
      } else if (pacienteData) {
        procedimentosComNomes.push({
          ...proc,
          procedimento_nome,
          duracao_efeito_meses,
          paciente_nome: pacienteData.nome,
        } as ProcedimentoRealizado);
      } else {
        procedimentosComNomes.push({
          ...proc,
          procedimento_nome,
          duracao_efeito_meses,
          paciente_nome: 'Informação indisponível',
        } as ProcedimentoRealizado);
      }
    }

    // --- Marcar procedimentos "Renovado" ---
    const mapaPorPacienteEProc: Record<string, ProcedimentoRealizado[]> = {};
    procedimentosComNomes.forEach(p => {
      const chave = `${p.paciente_id}-${(p.procedimento_nome || '').toLowerCase()}`;
      (mapaPorPacienteEProc[chave] = mapaPorPacienteEProc[chave] || []).push(p);
    });

    // Para cada grupo, ordenar por data ASC e marcar todos exceto o mais recente como renovado
    Object.values(mapaPorPacienteEProc).forEach(lista => {
      lista.sort((a, b) => {
        if (!a.data_procedimento || !b.data_procedimento) return 0;
        return new Date(a.data_procedimento).getTime() - new Date(b.data_procedimento).getTime();
      });
      if (lista.length > 1) {
        for (let i = 0; i < lista.length - 1; i++) {
          lista[i].status_calculado = 'renovado';
        }
      }
    });

    // Atualiza state com nova lista status
    setProcedimentos([...procedimentosComNomes]);
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

  // Atualiza filtro por status ao mudar a URL
  useEffect(() => {
    const v = searchParams?.get('filtroStatus') || '';
    setFiltroStatusURL(v);
    
    // Também atualiza filtro por categoria via URL
    const categoriaParam = searchParams?.get('categoria') || '';
    setCategoriaFiltro(categoriaParam);
  }, [searchParams]);

  const procedimentosFiltrados = procedimentos.filter(p => {
    const matchNome = searchTerm === '' || 
      (p.paciente_nome && p.paciente_nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.procedimento_nome && p.procedimento_nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.categoria_nome && p.categoria_nome.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchCategoria = categoriaFiltro === '' || p.categoria_nome === categoriaFiltro;
    let matchStatus = true;
    if (filtroStatusURL) {
      let statusCalc = p.status_calculado || '';
      if (!statusCalc || statusCalc !== 'renovado') {
        const chaveLookup = String(p.procedimento_nome || '').toLowerCase();
        const duracaoMeses = mapaDuracaoProcedimentos.get(chaveLookup) || null;
        const info = calcularStatusProcedimento(p.data_procedimento, duracaoMeses);
        statusCalc = info.status;
      }
      matchStatus = statusCalc === filtroStatusURL;
    }
    return matchNome && matchCategoria && matchStatus;
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

  if (loading && procedimentos.length === 0)
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header skeleton */}
        <div className="mb-6 md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <div className="animate-pulse bg-slate-200 rounded-lg h-8 w-48 mb-2"></div>
            <div className="animate-pulse bg-slate-200 rounded-lg h-4 w-64"></div>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <div className="animate-pulse bg-slate-200 rounded-xl h-12 w-40"></div>
          </div>
        </div>

        {/* Filtros skeleton */}
        <div className="mb-6 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
          <div className="animate-pulse bg-slate-200 rounded-lg h-12 flex-1"></div>
          <div className="animate-pulse bg-slate-200 rounded-lg h-12 w-48"></div>
          <div className="animate-pulse bg-slate-200 rounded-xl h-12 w-32"></div>
        </div>

        {/* Grid de cards skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <SkeletonLoader key={i} type="card" />
          ))}
        </div>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-slate-900">
            Gerenciar Procedimentos
          </h1>
          <p className="text-slate-600 text-sm mt-1">
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
        {/* Dropdown customizado Apple-like para categorias */}
        <div ref={dropdownRef} className="relative w-full sm:w-1/4 select-none">
          <button
            type="button"
            className={`w-full flex items-center justify-between bg-white/80 backdrop-blur-xl border border-slate-200 shadow-md rounded-2xl px-4 py-4 focus:ring-2 focus:ring-blue-300 focus:border-blue-300 text-base text-slate-700 font-normal outline-none transition-all duration-200 ${dropdownAberto ? 'ring-2 ring-blue-200 border-blue-200' : ''}`}
            onClick={() => setDropdownAberto((v) => !v)}
            aria-haspopup="listbox"
            aria-expanded={dropdownAberto}
          >
            <span className="truncate px-2 py-1 rounded-xl text-center w-full">{categoriaFiltro === '' ? 'Todas as Categorias' : categoriaFiltro}</span>
            <svg className={`w-5 h-5 ml-2 transition-transform duration-200 text-slate-400 self-center`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {dropdownAberto && (
            <ul
              tabIndex={-1}
              className="absolute z-20 mt-2 w-full bg-white/95 backdrop-blur-xl shadow-2xl rounded-2xl py-2 ring-1 ring-slate-100 border border-slate-100 animate-fade-in"
              role="listbox"
            >
              <li
                role="option"
                aria-selected={categoriaFiltro === ''}
                className={`cursor-pointer flex items-center justify-center px-4 py-2 text-base rounded-xl font-normal transition-all duration-150 w-full text-center break-words whitespace-normal ${categoriaFiltro === '' ? 'ring-1 ring-blue-300 shadow-sm font-semibold' : 'hover:bg-slate-200/80'}`}
                onClick={() => { setCategoriaFiltro(''); setDropdownAberto(false); }}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { setCategoriaFiltro(''); setDropdownAberto(false); } }}
                tabIndex={0}
              >
                Todas as Categorias
              </li>
              {categorias.map((categoria) => (
                <li
                  key={categoria}
                  role="option"
                  aria-selected={categoriaFiltro === categoria}
                  className={`cursor-pointer flex items-center justify-center px-4 py-2 text-base rounded-xl font-normal transition-all duration-150 w-full text-center break-words whitespace-normal ${categoriaFiltro === categoria ? 'ring-1 ring-blue-300 shadow-sm font-semibold' : 'hover:bg-slate-200/80'}`}
                  onClick={() => { setCategoriaFiltro(categoria); setDropdownAberto(false); }}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { setCategoriaFiltro(categoria); setDropdownAberto(false); } }}
                  tabIndex={0}
                >
                  {categoria}
                </li>
              ))}
            </ul>
          )}
        </div>
        {/* Fim dropdown customizado */}
        <button 
          onClick={() => { setSearchTerm(''); setCategoriaFiltro(''); }}
          className="inline-flex items-center px-4 py-2 rounded-xl shadow bg-gradient-to-r from-slate-500 to-slate-700 hover:from-slate-600 hover:to-slate-800 text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 hover:shadow-2xl"
        >
          Limpar Filtros
        </button>
      </div>

      {/* Lista mobile */}
      <ErrorBoundary name="Lista de Procedimentos">
        <ProcedimentosCardList procedimentos={procedimentosFiltrados} onDelete={(p:any)=>openModal(p)} />
      </ErrorBoundary>
      {/* Grid desktop */}
      <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {procedimentosFiltrados.map((proc) => {
          const chaveLookup = String(proc.procedimento_nome).toLowerCase();
          const duracaoMeses = mapaDuracaoProcedimentos.get(chaveLookup);
          const statusInfo = proc.status_calculado === 'renovado' ? statusRenovado() : calcularStatusProcedimento(proc.data_procedimento, duracaoMeses || null);

          return (
            <div key={proc.id} className="relative bg-white/60 backdrop-blur-xl shadow-lg rounded-2xl p-6 transition-all duration-200 hover:shadow-2xl hover:-translate-y-1 border border-white/30">
              <SeloStatus status={statusInfo.status} diasRestantes={statusInfo.diasRestantes} />
              
              <div className="flex justify-between items-start mb-0">
                <div className="flex-1">
                  <h3 
                    className="text-lg font-bold text-slate-900 leading-tight mb-1 hover:text-blue-600 cursor-pointer transition-colors"
                    onClick={() => router.push(`/procedimentos/${proc.id}`)}
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
                    title="Editar procedimento"
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