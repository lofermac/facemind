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
}

function formatarDataLista(data: string | null): string {
  if (!data) return '-';
  return new Date(data).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

function formatarValor(valor: number | null): string {
  if (valor === null || valor === undefined) return 'R$ -';
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function ProcedimentosInner() {
  const searchParams = useSearchParams();
  const [procedimentos, setProcedimentos] = useState<ProcedimentoRealizado[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('filtroNome') || '');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [procedimentoParaExcluir, setProcedimentoParaExcluir] = useState<ProcedimentoRealizado | null>(null);
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [categorias, setCategorias] = useState<string[]>([]);
  const router = useRouter();

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
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-sky-500 mr-3"></div>
        Carregando dados dos procedimentos...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-3xl font-extrabold leading-9 text-gray-900 sm:text-4xl sm:truncate">
            Gerenciar Procedimentos
          </h2>
          <p className="mt-2 text-base text-gray-600">
            Visualize e gerencie todos os procedimentos realizados
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Link href="/procedimentos/novo" legacyBehavior>
            <a className="inline-flex items-center px-5 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg cursor-pointer">
              + Novo Procedimento
            </a>
          </Link>
        </div>
      </div>

      <div className="flex space-x-4 mb-6">
        <input 
          type="text" 
          placeholder="Buscar por Paciente, Procedimento ou Categoria" 
          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-base border-gray-300 rounded-md p-4"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select 
          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-1/4 sm:text-base border-gray-300 rounded-md p-4"
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
          className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-gray-500 to-gray-700 hover:from-gray-600 hover:to-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg cursor-pointer"
        >
          Limpar Filtros
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {procedimentosFiltrados.map((proc) => (
          <div key={proc.id} className="relative bg-white shadow rounded-lg p-6 transition-transform transform hover:scale-105 hover:shadow-lg">
            <div className="flex justify-between items-start mb-0">
              <div className="flex-1">
                <h3 
                  className="text-lg font-bold text-gray-900 leading-tight mb-1 hover:text-blue-600 cursor-pointer"
                  onClick={() => router.push(`/procedimentos/editar/${proc.id}`)}
                >
                  {proc.procedimento_nome}
                </h3>
                <p className="text-base font-bold text-gray-900 mb-2">
                  {proc.categoria_nome}
                </p>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    router.push(`/procedimentos/editar/${proc.id}`);
                  }} 
                  className="text-blue-600 hover:text-blue-800 cursor-pointer"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    openModal(proc);
                  }} 
                  className="text-red-600 hover:text-red-800 cursor-pointer"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1"><span className="font-bold">Nome:</span> {proc.paciente_nome}</p>
              <p className="text-sm text-gray-500 mb-1"><span className="font-bold">Data:</span> {formatarDataLista(proc.data_procedimento)}</p>
              <p className="text-sm text-gray-500"><span className="font-bold">Valor:</span> {formatarValor(proc.valor_cobrado)}</p>
            </div>
          </div>
        ))}
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
              <div className="fixed inset-0 bg-black bg-opacity-30 transition-opacity" />
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
              <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                      Confirmar Exclusão
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Tem certeza que deseja excluir o procedimento "{procedimentoParaExcluir?.procedimento_nome}"? Esta ação não pode ser desfeita.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                    onClick={confirmDelete}
                  >
                    Excluir
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
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