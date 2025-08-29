import React, { useState } from 'react';
import { 
  ChartBarIcon, 
  ClipboardDocumentListIcon, 
  CameraIcon, 
  CalendarIcon, 
  DocumentIcon, 
  CurrencyDollarIcon 
} from '@heroicons/react/24/outline';
import TabelaDeProcedimentos from './pacientes/TabelaDeProcedimentos';
import PatientKPIs from './PatientKPIs';
import DocumentosUpload from './DocumentosUpload';

interface ProcedimentoRealizado {
  id: string;
  data_procedimento: string | null;
  valor_cobrado: number | null;
  procedimento_tabela_valores_id?: {
    nome_procedimento: string | null;
    duracao_efeito_meses?: number | null;
  } | null;
  custo_produto?: number | null;
  custo_insumos?: number | null;
  custo_sala?: number | null;
}

interface Agendamento {
  id: string;
  data: string | null;
  hora: string | null;
  rotulo: string | null;
}

interface Paciente {
  id: string;
  nome: string;
  cpf: string | null;
  whatsapp: string | null;
  email: string | null;
  data_nascimento: string | null;
  status: string | null;
  procedimentos_realizados: ProcedimentoRealizado[];
  agendamentos: Agendamento[];
}

interface ProfileTabsProps {
  paciente: Paciente;
}

const tabs = [
  { id: 'overview', name: 'Visão Geral', icon: ChartBarIcon },
  { id: 'procedures', name: 'Procedimentos', icon: ClipboardDocumentListIcon },
  { id: 'documents', name: 'Documentos', icon: DocumentIcon },
];

export default function ProfileTabs({ paciente }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState('overview');

  // Calcular KPIs para a aba Visão Geral
  const calcularKPIs = () => {
    const valorTotalGasto = paciente.procedimentos_realizados.reduce((total, proc) => {
      return total + (proc.valor_cobrado || 0);
    }, 0);

    // Última visita (mais recente entre procedimentos e agendamentos passados)
    const datasProcedimentos = paciente.procedimentos_realizados
      .map(p => p.data_procedimento)
      .filter(Boolean) as string[];
    
    const datasAgendamentos = paciente.agendamentos
      .filter(a => a.data && new Date(a.data) <= new Date())
      .map(a => a.data) as string[];

    const todasDatas = [...datasProcedimentos, ...datasAgendamentos];
    const ultimaVisita = todasDatas.length > 0 
      ? new Date(Math.max(...todasDatas.map(d => new Date(d).getTime())))
      : null;

    // Próximo agendamento
    const agendamentosFuturos = paciente.agendamentos
      .filter(a => a.data && new Date(a.data) > new Date())
      .sort((a, b) => new Date(a.data!).getTime() - new Date(b.data!).getTime());
    
    const proximoAgendamento = agendamentosFuturos[0] || null;

    return {
      valorTotalGasto,
      ultimaVisita,
      proximoAgendamento
    };
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        // --- KPIs Estratégicos ---
        const faturamento = paciente.procedimentos_realizados.reduce((total, proc) => total + (proc.valor_cobrado || 0), 0);
        const lucro = paciente.procedimentos_realizados.reduce((total, proc) => {
          const valor = proc.valor_cobrado || 0;
          const custo_produto = proc.custo_produto || 0;
          const custo_insumos = proc.custo_insumos || 0;
          const custo_sala = proc.custo_sala || 0;
          return total + (valor - custo_produto - custo_insumos - custo_sala);
        }, 0);
        const procedimentos = paciente.procedimentos_realizados.length;
        const ultimoProcedimento = paciente.procedimentos_realizados.length > 0
          ? paciente.procedimentos_realizados.reduce((max, proc) => {
              if (!proc.data_procedimento) return max;
              if (!max) return proc.data_procedimento;
              return new Date(proc.data_procedimento) > new Date(max) ? proc.data_procedimento : max;
            }, null as string | null)
          : null;
        function calcularIndiceFidelidade() {
          const hoje = new Date();
          const procedimentos = paciente.procedimentos_realizados.filter(p => p.data_procedimento);
          
          if (procedimentos.length === 0) return null;

          // 1. REGULARIDADE DE PROCEDIMENTOS (40%)
          let scoreRegularidade = 0;
          const grupos: Record<string, typeof procedimentos> = {};
          
          // Agrupar por tipo de procedimento
          procedimentos.forEach(proc => {
            const nome = proc.procedimento_tabela_valores_id?.nome_procedimento || 'Outros';
            grupos[nome] = grupos[nome] || [];
            grupos[nome].push(proc);
          });

          // Calcular regularidade para cada tipo
          let totalRenovacoes = 0;
          let renovacoesRegulares = 0;
          
          Object.values(grupos).forEach(lista => {
            if (lista.length < 2) return;
            
            lista.sort((a, b) => new Date(a.data_procedimento!).getTime() - new Date(b.data_procedimento!).getTime());
            
            for (let i = 1; i < lista.length; i++) {
              const anterior = lista[i - 1];
              const atual = lista[i];
              const duracao = anterior.procedimento_tabela_valores_id?.duracao_efeito_meses || 6;
              
              const dataEsperada = new Date(anterior.data_procedimento!);
              dataEsperada.setMonth(dataEsperada.getMonth() + duracao);
              
              const dataReal = new Date(atual.data_procedimento!);
              const diferenca = Math.abs((dataReal.getTime() - dataEsperada.getTime()) / (1000 * 60 * 60 * 24));
              
              totalRenovacoes++;
              // Considera regular se fez dentro de ±30 dias do período ideal
              if (diferenca <= 30) renovacoesRegulares++;
            }
          });
          
          if (totalRenovacoes > 0) {
            scoreRegularidade = (renovacoesRegulares / totalRenovacoes) * 40;
          }

          // 2. LONGEVIDADE COMO PACIENTE (25%)
          let scoreLongevidade = 0;
          const primeiroProcedimento = procedimentos
            .sort((a, b) => new Date(a.data_procedimento!).getTime() - new Date(b.data_procedimento!).getTime())[0];
          
          if (primeiroProcedimento?.data_procedimento) {
            const inicioRelacionamento = new Date(primeiroProcedimento.data_procedimento);
            const mesesComoCliente = (hoje.getTime() - inicioRelacionamento.getTime()) / (1000 * 60 * 60 * 24 * 30);
            
            // Pontuação progressiva: 6 meses = 10%, 12 meses = 15%, 24+ meses = 25%
            if (mesesComoCliente >= 24) scoreLongevidade = 25;
            else if (mesesComoCliente >= 12) scoreLongevidade = 15;
            else if (mesesComoCliente >= 6) scoreLongevidade = 10;
            else scoreLongevidade = (mesesComoCliente / 6) * 10;
          }

          // 3. DIVERSIFICAÇÃO DE TRATAMENTOS (20%)
          const tiposUnicos = new Set(procedimentos.map(p => 
            p.procedimento_tabela_valores_id?.nome_procedimento || 'Outros'
          ));
          let scoreDiversificacao = 0;
          
          if (tiposUnicos.size === 1) scoreDiversificacao = 5;  // Só um tipo
          else if (tiposUnicos.size === 2) scoreDiversificacao = 12; // Dois tipos
          else if (tiposUnicos.size >= 3) scoreDiversificacao = 20;  // Três ou mais tipos

          // 4. VALOR INVESTIDO RELATIVO (15%)
          let scoreInvestimento = 0;
          const valorTotal = procedimentos.reduce((sum, p) => sum + (p.valor_cobrado || 0), 0);
          const valorMedioPorProcedimento = valorTotal / procedimentos.length;
          
          // Pontuação baseada no valor médio por procedimento
          if (valorMedioPorProcedimento >= 2000) scoreInvestimento = 15;
          else if (valorMedioPorProcedimento >= 1000) scoreInvestimento = 12;
          else if (valorMedioPorProcedimento >= 500) scoreInvestimento = 8;
          else scoreInvestimento = 5;

          // SCORE FINAL
          const indiceTotal = scoreRegularidade + scoreLongevidade + scoreDiversificacao + scoreInvestimento;
          
          // Garantir que o índice fique entre 0 e 100
          return Math.min(100, Math.max(0, Math.round(indiceTotal)));
        }
        const indiceFidelidade = calcularIndiceFidelidade();
        return (
          <div className="space-y-6">
            <PatientKPIs
              faturamento={faturamento}
              lucro={lucro}
              procedimentos={procedimentos}
              ultimoProcedimento={ultimoProcedimento}
              indiceFidelidade={indiceFidelidade}
            />
          </div>
        );

      case 'procedures':
        return (
          <div className="bg-white/60 backdrop-blur-xl rounded-xl p-6 border border-white/30">
            <TabelaDeProcedimentos procedimentos={paciente.procedimentos_realizados} />
          </div>
        );

      case 'documents':
        return (
          <div className="bg-white/60 backdrop-blur-xl rounded-xl p-6 border border-white/30">
            <DocumentosUpload pacienteId={paciente.id} pacienteNome={paciente.nome} />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-2 border border-white/30">
        <nav className="flex space-x-1" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                } group relative min-w-0 flex-1 overflow-hidden rounded-xl py-3 px-4 text-center text-sm font-medium transition-all duration-200 focus:z-10`}
              >
                <Icon className="h-5 w-5 mx-auto mb-1" />
                <span className="truncate">{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {renderTabContent()}
      </div>
    </div>
  );
}
