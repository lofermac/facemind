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
          const grupos: Record<string, typeof paciente.procedimentos_realizados> = {};
          paciente.procedimentos_realizados.forEach(proc => {
            const id = proc.procedimento_tabela_valores_id ? String((proc.procedimento_tabela_valores_id as any).id || (proc.procedimento_tabela_valores_id as any)._id || (proc.procedimento_tabela_valores_id as any).nome_procedimento || '') : '';
            if (!id) return;
            grupos[id] = grupos[id] || [];
            grupos[id].push(proc);
          });
          let pares: { anterior: typeof paciente.procedimentos_realizados[0], atual: typeof paciente.procedimentos_realizados[0] }[] = [];
          Object.values(grupos).forEach(lista => {
            if (lista.length < 2) return;
            lista.sort((a, b) => {
              if (!a.data_procedimento || !b.data_procedimento) return 0;
              return new Date(a.data_procedimento).getTime() - new Date(b.data_procedimento).getTime();
            });
            for (let i = 1; i < lista.length; i++) {
              pares.push({ anterior: lista[i - 1], atual: lista[i] });
            }
          });
          if (pares.length === 0) return null;
          const diasAntecedencia: number[] = pares.map(({ anterior, atual }) => {
            if (!anterior.data_procedimento || !atual.data_procedimento) return 0;
            const duracao = anterior.procedimento_tabela_valores_id?.duracao_efeito_meses || 0;
            if (!duracao) return 0;
            const dataVencimentoTeorico = new Date(anterior.data_procedimento);
            dataVencimentoTeorico.setMonth(dataVencimentoTeorico.getMonth() + duracao);
            const dataAtual = new Date(atual.data_procedimento);
            const diffDias = Math.floor((dataVencimentoTeorico.getTime() - dataAtual.getTime()) / (1000 * 60 * 60 * 24));
            return diffDias;
          });
          const mediaDias = diasAntecedencia.reduce((a, b) => a + b, 0) / diasAntecedencia.length;
          let indice = ((mediaDias + 60) / (30 + 60)) * 100;
          if (indice < 0) indice = 0;
          if (indice > 100) indice = 100;
          return indice;
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
