'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { supabase } from '@/utils/supabaseClient';
import { toast } from 'sonner';
import { PlusCircleIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import PacienteForm from '@/components/PacienteForm';
import AppleLikeLoader from '@/components/AppleLikeLoader';

// Tipos
interface ProcedimentoRealizadoParaStatus {
  id: string;
  data_procedimento: string | null; 
  procedimento_nome: string | null; 
}

interface TipoProcedimentoComDuracao {
  nome_procedimento: string; 
  duracao_efeito_meses: number | null; 
}

interface PacienteBase {
  id: string;
  nome: string;
  cpf: string | null;
  whatsapp: string | null;
  data_nascimento: string | null;
  email: string | null;
  status: 'Ativo' | 'Inativo' | null;
  created_at: string;
  procedimentos_realizados?: ProcedimentoRealizadoParaStatus[]; 
}

interface PacienteComStatusCalculado extends PacienteBase {
  status_calculado: string; 
  created_at_formatada: string;
  cpf_formatado: string;
}

const opcoesStatusFiltro = [
  { value: 'Todos', label: 'Todos os Status' },
  { value: 'Novo', label: 'Novo' },
  { value: 'Ativo', label: 'Ativo (Em vigência)' },
  { value: 'Contato', label: 'Contato (Vence em 30d)' },
  { value: 'Vencido', label: 'Vencido' },
  { value: 'Verificar', label: 'Verificar Duração' },
  { value: 'Inativo', label: 'Inativo (Arquivado)' },
];

// --- Funções Utilitárias de Formatação ---
const formatarData = (dataISO: string | null | undefined): string => {
  if (!dataISO) return 'N/A';
  try {
    const dataObj = new Date(dataISO);
    if (isNaN(dataObj.getTime())) return 'Data inválida';
    const dia = String(dataObj.getUTCDate()).padStart(2, '0');
    const mes = String(dataObj.getUTCMonth() + 1).padStart(2, '0');
    const ano = dataObj.getUTCFullYear();
    return `${dia}/${mes}/${ano}`;
  } catch (e: any) { return 'Data inválida'; }
};

const formatarCPF = (cpf: string | null | undefined): string => {
  if (!cpf) return 'N/A';
  const cpfLimpo = cpf.replace(/\D/g, '');
  if (cpfLimpo.length !== 11) return cpf;
  return cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

const formatarWhatsApp = (whatsapp: string | null | undefined): string => {
  if (!whatsapp) return 'N/A';
  const digitos = whatsapp.replace(/\D/g, '');
  if (digitos.length === 11) return `(${digitos.substring(0, 2)}) ${digitos.substring(2, 7)}-${digitos.substring(7)}`;
  if (digitos.length === 10) return `(${digitos.substring(0, 2)}) ${digitos.substring(2, 6)}-${digitos.substring(6)}`;
  return whatsapp;
};

// Função para calcular a idade
const calcularIdade = (dataNascimento: string | null | undefined): string => {
  if (!dataNascimento) return 'N/A';
  const hoje = new Date();
  const nascimento = new Date(dataNascimento);
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const mes = hoje.getMonth() - nascimento.getMonth();
  if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
    idade--;
  }
  return idade.toString();
};
// --- Fim das Funções Utilitárias ---

export default function GerenciarPacientesPage() {
  const [pacientesParaLista, setPacientesParaLista] = useState<PacienteComStatusCalculado[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('Todos');
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const [pacienteParaDeletar, setPacienteParaDeletar] = useState<PacienteComStatusCalculado | null>(null);
  const [mapaDuracaoProcedimentos, setMapaDuracaoProcedimentos] = useState<Map<string, number | null>>(new Map());
  const [showNovoPacienteModal, setShowNovoPacienteModal] = useState(false);

  const getStatusColor = (statusCalculado: string | null) => {
    if (statusCalculado === 'Inativo') return 'bg-gray-400 text-white';
    if (statusCalculado === 'Novo') return 'bg-blue-100 text-blue-800';
    if (statusCalculado === 'Verificar') return 'bg-purple-100 text-purple-800';
    if (statusCalculado === 'Contato') return 'bg-yellow-100 text-yellow-800';
    if (statusCalculado === 'Ativo') return 'bg-green-100 text-green-800';
    if (statusCalculado === 'Vencido') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  const fetchDadosParaStatus = useCallback(async () => {
    setLoading(true);
    try {
      const { data: tiposProcedimentoData, error: errorTipos } = await supabase
        .from('procedimentos_tabela_valores') 
        .select('nome_procedimento, duracao_efeito_meses');

      if (errorTipos) {
        toast.error('Erro ao buscar durações dos tipos de procedimento.');
        throw errorTipos;
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

      let queryPacientes = supabase
        .from('pacientes')
        .select('id, nome, cpf, whatsapp, data_nascimento, email, status, created_at, procedimentos_realizados(id, data_procedimento, procedimento_nome)')
        .order('nome', { ascending: true });

      if (filtroNome) {
        queryPacientes = queryPacientes.ilike('nome', `%${filtroNome}%`);
      }

      const { data: pacientesBase, error: errorPacientes } = await queryPacientes;

      if (errorPacientes) {
        toast.error('Erro ao buscar pacientes: ' + errorPacientes.message);
        setPacientesParaLista([]);
        throw errorPacientes;
      }
      
      console.log("Dados brutos dos pacientes (pacientesBase):", pacientesBase);

      if (!pacientesBase || pacientesBase.length === 0) {
        setPacientesParaLista([]);
        setLoading(false);
        return;
      }

      const hojeUtc = new Date(); 
      hojeUtc.setUTCHours(0,0,0,0);

      const pacientesProcessados = pacientesBase.map((paciente): PacienteComStatusCalculado => {
        let status_calculado: string;

        if (paciente.status === 'Inativo') {
          status_calculado = 'Inativo';
        } else {
          const procsRealizados = paciente.procedimentos_realizados || [];
          
          if (procsRealizados.length === 0) {
            status_calculado = 'Novo';
          } else {
            const procsOrdenados = [...procsRealizados].sort((a, b) => {
                if (!a.data_procedimento || !b.data_procedimento) return 0;
                return new Date(b.data_procedimento).getTime() - new Date(a.data_procedimento).getTime();
            });
            
            const ultimoProcedimento = procsOrdenados[0];
            
            if (!ultimoProcedimento || !ultimoProcedimento.data_procedimento || !ultimoProcedimento.procedimento_nome) {
              status_calculado = 'Verificar'; 
            } else {
              const chaveLookup = String(ultimoProcedimento.procedimento_nome).toLowerCase();
              const duracaoMeses = novoMapaDuracao.get(chaveLookup);

              if (duracaoMeses === undefined || duracaoMeses === null || isNaN(duracaoMeses) || duracaoMeses <= 0) {
                status_calculado = 'Verificar'; 
              } else {
                const dataRealizacao = new Date(ultimoProcedimento.data_procedimento);
                // As datas do Supabase (DATE YYYY-MM-DD) são interpretadas como UTC meia-noite pelo new Date().
                // Para evitar problemas de fuso horário ao adicionar meses, vamos trabalhar com UTC.
                dataRealizacao.setUTCHours(0,0,0,0); 
                
                const dataVencimento = new Date(dataRealizacao.getTime()); // Cria cópia
                dataVencimento.setUTCMonth(dataVencimento.getUTCMonth() + duracaoMeses);
                
                // Não é necessário setHours(0,0,0,0) em dataVencimento de novo se dataRealizacao já estava assim.

                const diffDiasParaVencer = (dataVencimento.getTime() - hojeUtc.getTime()) / (1000 * 60 * 60 * 24);

                if (diffDiasParaVencer < 0) {
                  status_calculado = 'Vencido';
                } else if (diffDiasParaVencer <= 30) {
                  status_calculado = 'Contato';
                } else {
                  status_calculado = 'Ativo';
                }
              }
            }
          }
        }
        
        return {
          ...paciente,
          status_calculado,
          cpf_formatado: formatarCPF(paciente.cpf),
          created_at_formatada: formatarData(paciente.created_at),
        };
      });

      let pacientesFiltradosFinal = pacientesProcessados;
      if (filtroStatus && filtroStatus !== 'Todos') {
          pacientesFiltradosFinal = pacientesProcessados.filter(p => p.status_calculado === filtroStatus);
      }

      setPacientesParaLista(pacientesFiltradosFinal);

    } catch (e) {
      console.error("Falha geral em fetchDadosParaStatus", e);
      setPacientesParaLista([]); 
    } finally {
      setLoading(false);
    }
  }, [filtroNome, filtroStatus]); 

  useEffect(() => {
    fetchDadosParaStatus();
  }, [fetchDadosParaStatus]); 


  const handleDeleteRequest = (paciente: PacienteComStatusCalculado) => {
    setPacienteParaDeletar(paciente);
    setShowConfirmDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!pacienteParaDeletar) return;
    const { error: errorProcs } = await supabase
        .from('procedimentos_realizados')
        .delete()
        .eq('paciente_id', pacienteParaDeletar.id);

    if (errorProcs) {
        toast.error(`Erro ao deletar procedimentos: ${errorProcs.message}. Tentando deletar paciente.`);
    }

    const { error: errorPaciente } = await supabase
        .from('pacientes')
        .delete()
        .eq('id', pacienteParaDeletar.id);

    if (errorPaciente) {
        toast.error(`Erro ao deletar paciente: ${errorPaciente.message}`);
    } else {
        toast.success(`Paciente ${pacienteParaDeletar.nome} foi deletado.`);
        fetchDadosParaStatus(); 
    }
    setShowConfirmDeleteModal(false);
    setPacienteParaDeletar(null);
  };

  if (loading && pacientesParaLista.length === 0) {
    return (
      <div className="p-6 text-center flex justify-center items-center min-h-[calc(100vh-100px)]">
        <AppleLikeLoader text="Carregando dados dos pacientes..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-fluid-h1 text-slate-900">
            Gerenciar Pacientes
          </h2>
          <p className="mt-2 text-base text-slate-600">
            Visualize e gerencie todos os pacientes cadastrados
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button onClick={() => setShowNovoPacienteModal(true)} className="inline-flex items-center px-6 py-3 rounded-xl shadow bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-semibold text-base focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all duration-200 ease-in-out transform hover:scale-105 hover:shadow-2xl">
            <PlusCircleIcon className="-ml-1 mr-2 h-6 w-6" aria-hidden="true" />
            Novo Paciente
          </button>
        </div>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
        <input
          type="text"
          placeholder="Buscar por Nome"
          className="bg-white/60 backdrop-blur-xl border border-white/30 shadow rounded-xl p-3 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 block w-full sm:text-base text-slate-700 placeholder-slate-400 transition-all duration-200"
          value={filtroNome}
          onChange={(e) => setFiltroNome(e.target.value)}
        />
        <select
          className="bg-white/60 backdrop-blur-xl border border-white/30 shadow rounded-xl p-3 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 block sm:text-base text-slate-700 transition-all duration-200"
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
        >
          {opcoesStatusFiltro.map((opcao) => (
            <option key={opcao.value} value={opcao.value}>{opcao.label}</option>
          ))}
        </select>
        <button
          onClick={() => {
            setFiltroNome('');
            setFiltroStatus('Todos');
          }}
          className="inline-flex items-center px-4 py-2 rounded-xl shadow bg-gradient-to-r from-slate-500 to-slate-700 hover:from-slate-600 hover:to-slate-800 text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 hover:shadow-2xl"
        >
          Limpar Filtros
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pacientesParaLista.map((paciente) => (
          <div key={paciente.id} className="relative bg-white/60 backdrop-blur-xl shadow-lg rounded-2xl p-5 transition-all duration-200 hover:shadow-2xl hover:-translate-y-1 border border-white/30">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold shadow-sm border border-white/30 ${getStatusColor(paciente.status_calculado)} absolute -top-3 left-3`}>{paciente.status_calculado}</span>

                <Link 
                  href={`/procedimentos?filtroNome=${encodeURIComponent(paciente.nome)}`}
                  className="text-lg font-bold text-slate-900 hover:text-blue-600 cursor-pointer transition-colors block pr-10"
                >
                  {paciente.nome}
                </Link>
              </div>
              <div className="flex space-x-2 absolute top-3 right-3">
                <Link 
                  href={`/pacientes/editar/${paciente.id}`} 
                  className="bg-white/60 backdrop-blur-md rounded-full p-2 shadow text-blue-600 hover:text-blue-800 hover:shadow-lg transition-all"
                >
                  <PencilIcon className="h-5 w-5" />
                </Link>
                <button 
                  onClick={() => handleDeleteRequest(paciente)}
                  className="bg-white/60 backdrop-blur-md rounded-full p-2 shadow text-red-600 hover:text-red-800 hover:shadow-lg transition-all"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-1"><strong>Idade:</strong> {calcularIdade(paciente.data_nascimento)}</p>
            <div className="flex justify-between items-center">
              <p className="text-sm text-slate-600 mb-1"><strong>WhatsApp:</strong> {formatarWhatsApp(paciente.whatsapp)}</p>
              <a href={`https://wa.me/+55${paciente.whatsapp?.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center rounded-full bg-white/40 backdrop-blur-md shadow text-green-500 hover:text-green-600 hover:shadow-lg transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6">
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.553 4.105 1.523 5.84L0 24l6.32-1.523A11.944 11.944 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22.5c-1.89 0-3.675-.47-5.25-1.29l-.375-.21-3.75.905.905-3.75-.21-.375A10.455 10.455 0 011.5 12c0-5.799 4.701-10.5 10.5-10.5S22.5 6.201 22.5 12 17.799 22.5 12 22.5zm5.25-7.5c-.285-.143-1.68-.83-1.94-.925-.26-.095-.45-.143-.64.143-.19.285-.735.925-.9 1.11-.165.19-.33.215-.615.072-.285-.143-1.2-.44-2.29-1.4-.845-.755-1.415-1.685-1.58-1.97-.165-.285-.018-.44.125-.582.13-.13.285-.33.43-.495.145-.165.19-.285.285-.475.095-.19.048-.357-.024-.5-.072-.143-.64-1.54-.88-2.115-.23-.555-.465-.48-.64-.49-.165-.007-.357-.01-.55-.01-.19 0-.5.072-.76.357-.26.285-.99.965-.99 2.36 0 1.395 1.015 2.74 1.155 2.93.14.19 2 3.05 4.845 4.28.68.292 1.21.465 1.625.595.68.215 1.3.185 1.79.112.545-.08 1.68-.685 1.92-1.35.24-.665.24-1.235.165-1.35-.072-.115-.26-.19-.545-.33z" />
                </svg>
              </a>
            </div>
            <p className="text-sm text-slate-600 mb-1"><strong>Data de Criação:</strong> {new Date(paciente.created_at).toLocaleDateString('pt-BR')}</p>
          </div>
        ))}
      </div>

      {showConfirmDeleteModal && pacienteParaDeletar && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
          <div className="bg-white/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Confirmar Exclusão</h3>
            <p className="text-slate-700 mb-6">
              Tem certeza que deseja excluir o paciente <span className="font-bold">{pacienteParaDeletar.nome}</span>? Todos os procedimentos associados a este paciente também serão excluídos. Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end space-x-3">
              <button onClick={() => { setShowConfirmDeleteModal(false); setPacienteParaDeletar(null); }}
                className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 transition-colors">
                Cancelar
              </button>
              <button onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Novo Paciente */}
      {showNovoPacienteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-70 backdrop-blur-xl">
          <div className="bg-white/90 backdrop-blur-xl p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Cadastrar Novo Paciente</h3>
            <PacienteForm onCancel={() => setShowNovoPacienteModal(false)} />
          </div>
        </div>
      )}
    </div>
  );
}