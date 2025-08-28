import React from 'react';
import { PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

interface ProcedimentoRealizado {
  id: string;
  data_procedimento: string | null;
  valor_cobrado: number | null;
  procedimento_tabela_valores_id?: {
    nome_procedimento: string | null;
  } | null;
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

interface ProfileHeaderProps {
  paciente: Paciente;
}

export default function ProfileHeader({ paciente }: ProfileHeaderProps) {
  // Calcular idade
  const calcularIdade = (dataNascimento: string | null): number | null => {
    if (!dataNascimento) return null;
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mesAtual = hoje.getMonth();
    const mesNascimento = nascimento.getMonth();
    
    if (mesAtual < mesNascimento || (mesAtual === mesNascimento && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    
    return idade;
  };

  // Obter cor do status
  const getStatusColor = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case 'ativo':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inativo':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'verificar':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Função para formatar CPF
  const formatarCPF = (cpf: string | null) => {
    if (!cpf) return '';
    // Remove tudo que não for dígito
    const digits = cpf.replace(/\D/g, '');
    if (digits.length !== 11) return cpf; // Se não for 11 dígitos, retorna como está
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const idade = calcularIdade(paciente.data_nascimento);
  const whatsappFormatted = paciente.whatsapp?.replace(/\D/g, ''); // Remove caracteres não numéricos

  return (
    <div className="bg-white/80 backdrop-blur-xl shadow-xl rounded-2xl p-6 border border-white/30">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Informações principais */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-slate-900">{paciente.nome}</h1>
            {paciente.status && (
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(paciente.status)}`}>
                {paciente.status}
              </span>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-slate-600">
            {idade && (
              <span>{idade} anos</span>
            )}
            {idade && paciente.email && <span className="hidden sm:inline">•</span>}
            {paciente.email && (
              <span>{paciente.email}</span>
            )}
            {paciente.cpf && (
              <>
                <span className="hidden sm:inline">•</span>
                <span>CPF: {formatarCPF(paciente.cpf)}</span>
              </>
            )}
          </div>
        </div>

        {/* Ações rápidas */}
        <div className="flex items-center gap-3">
          {whatsappFormatted && (
            <a
              href={`https://wa.me/55${whatsappFormatted}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <PhoneIcon className="h-4 w-4" />
              <span className="hidden sm:inline font-bold">WhatsApp</span>
            </a>
          )}
          
          {paciente.email && (
            <a
              href={`mailto:${paciente.email}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <EnvelopeIcon className="h-4 w-4" />
              <span className="hidden sm:inline font-bold">E-mail</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
