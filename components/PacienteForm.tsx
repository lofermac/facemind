// components/PacienteForm.tsx
'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';
import { toast } from 'sonner';
import { IMaskInput } from 'react-imask';

// Interface para os dados do formulário do paciente
export interface PacienteFormData {
  nome: string;
  cpf: string | null;
  whatsapp: string | null;
  data_nascimento: string | null; // Será armazenado como YYYY-MM-DD no banco, mas input DD/MM/YYYY
  email: string | null;
  status: 'Ativo' | 'Inativo'; // Para novos, podemos default para 'Ativo'
}

// Interface para o paciente existente (usaremos para edição depois)
export interface PacienteExistente extends PacienteFormData {
  id: string;
  created_at: string;
}

interface PacienteFormProps {
  pacienteInicial?: PacienteExistente | null; // Para o modo de edição
  onFormSubmit?: (pacienteId: string) => void; // Callback opcional após salvar
  onCancel?: () => void; // Callback opcional para cancelar
}

export default function PacienteForm({ pacienteInicial, onFormSubmit, onCancel }: PacienteFormProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isEditMode = !!pacienteInicial;

  const [nome, setNome] = useState(pacienteInicial?.nome || '');
  const [cpf, setCpf] = useState(pacienteInicial?.cpf || '');
  const [whatsapp, setWhatsapp] = useState(pacienteInicial?.whatsapp || '');
  const [dataNascimento, setDataNascimento] = useState(pacienteInicial?.data_nascimento || ''); // Input DD/MM/YYYY
  const [email, setEmail] = useState(pacienteInicial?.email || '');
  const [status, setStatus] = useState<'Ativo' | 'Inativo'>(pacienteInicial?.status || 'Ativo');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Efeito para preencher o formulário no modo de edição
  // (incluindo conversão da data_nascimento do formato YYYY-MM-DD para DD/MM/YYYY para o input)
  useEffect(() => {
    if (isEditMode && pacienteInicial) {
      setNome(pacienteInicial.nome);
      setCpf(pacienteInicial.cpf || '');
      setWhatsapp(pacienteInicial.whatsapp || '');
      if (pacienteInicial.data_nascimento) {
        // Converte YYYY-MM-DD para DD/MM/YYYY para a máscara
        const parts = pacienteInicial.data_nascimento.split('-');
        if (parts.length === 3) {
          setDataNascimento(`${parts[2]}/${parts[1]}/${parts[0]}`);
        } else {
          setDataNascimento('');
        }
      } else {
        setDataNascimento('');
      }
      setEmail(pacienteInicial.email || '');
      setStatus(pacienteInicial.status || 'Ativo');
    }
  }, [isEditMode, pacienteInicial]);

  const handleRedirect = () => {
    console.log('Tentando redirecionar...');
    console.log('Pathname atual:', pathname);
    
    // Forçar uma navegação completa
    window.location.href = '/pacientes';
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    if (!nome.trim()) {
      toast.error('O nome do paciente é obrigatório.');
      setIsSubmitting(false);
      return;
    }

    let dataNascimentoFormatadaParaBanco: string | null = null;
    if (dataNascimento) {
      const parts = dataNascimento.split('/');
      if (parts.length === 3 && parts[0].length === 2 && parts[1].length === 2 && parts[2].length === 4) {
        // Validação básica da data (não verifica se é uma data real, apenas formato)
        const dia = parseInt(parts[0], 10);
        const mes = parseInt(parts[1], 10);
        const ano = parseInt(parts[2], 10);
        if (dia > 0 && dia <= 31 && mes > 0 && mes <= 12 && ano > 1900 && ano < 2100) {
            const dataObj = new Date(ano, mes - 1, dia); // Mês é 0-indexed
            const hoje = new Date();
            hoje.setHours(0,0,0,0); // Ignora a hora para comparação
            if (dataObj > hoje) {
                toast.error('A data de nascimento não pode ser uma data futura.');
                setIsSubmitting(false);
                return;
            }
            dataNascimentoFormatadaParaBanco = `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
        } else {
            toast.error('Data de nascimento inválida. Use o formato DD/MM/AAAA.');
            setIsSubmitting(false);
            return;
        }
      } else if (dataNascimento.trim() !== '') {
        toast.error('Formato da data de nascimento inválido. Use DD/MM/AAAA.');
        setIsSubmitting(false);
        return;
      }
    }
    
    const cpfLimpo = cpf ? cpf.replace(/\D/g, '') : null;
    if (cpfLimpo && cpfLimpo.length !== 11) {
        toast.error('CPF inválido. Deve conter 11 dígitos.');
        setIsSubmitting(false);
        return;
    }

    const whatsappLimpo = whatsapp ? whatsapp.replace(/\D/g, '') : null;
    // Validação simples de tamanho para whatsapp, pode ser melhorada
    if (whatsappLimpo && (whatsappLimpo.length < 10 || whatsappLimpo.length > 11) && whatsappLimpo.length !==0) {
        toast.error('Número de WhatsApp inválido.');
        setIsSubmitting(false);
        return;
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      toast.error('Você precisa estar logado para realizar esta ação.');
      setIsSubmitting(false);
      return;
    }

    const pacienteData: PacienteFormData & { user_id: string } = {
      nome: nome.trim(),
      cpf: cpfLimpo || null,
      whatsapp: whatsappLimpo || null,
      data_nascimento: dataNascimentoFormatadaParaBanco,
      email: email.trim() || null,
      status: status,
      user_id: user.id
    };

    try {
      if (isEditMode && pacienteInicial) {
        const { data, error } = await supabase
          .from('pacientes')
          .update(pacienteData)
          .eq('id', pacienteInicial.id)
          .select('id')
          .single();

        if (error) throw error;
        if (data) {
        toast.success('Paciente atualizado com sucesso!');
          if (onFormSubmit) {
            onFormSubmit(data.id);
          } else {
            handleRedirect();
          }
        }
      } else {
        const { data, error } = await supabase
          .from('pacientes')
          .insert([pacienteData])
          .select('id')
          .single();

        if (error) throw error;
        if (data) {
          console.log('Paciente criado com sucesso, ID:', data.id);
        toast.success('Paciente cadastrado com sucesso!');
          
          // Tentar redirecionar após um breve delay
          setTimeout(() => {
            console.log('Iniciando redirecionamento...');
            if (onFormSubmit) {
              console.log('Executando onFormSubmit...');
              onFormSubmit(data.id);
      } else {
              console.log('Executando redirecionamento direto...');
              handleRedirect();
            }
          }, 500);
      }
      }
    } catch (error: any) {
      console.error('Erro ao salvar paciente:', error);
      toast.error(`Erro ao salvar paciente: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      handleRedirect();
    }
  };

  // Adicionando pop-up de confirmação ao inativar paciente
  const handleStatusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setShowConfirmModal(true);
    } else {
      setStatus('Ativo');
    }
  };

  const confirmInativar = () => {
    setStatus('Inativo');
    setShowConfirmModal(false);
  };

  const cancelInativar = () => {
    setShowConfirmModal(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="nome" className="block text-sm font-medium text-gray-700">
          Nome Completo <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="nome"
          id="nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="cpf" className="block text-sm font-medium text-gray-700">
            CPF
          </label>
          <IMaskInput
            mask="000.000.000-00"
            value={cpf}
            onAccept={(value: any) => setCpf(value)}
            name="cpf"
            id="cpf"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
            placeholder="000.000.000-00"
          />
        </div>
        <div>
          <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700">
            WhatsApp
          </label>
          <IMaskInput
            mask={[{ mask: '(00) 0000-0000' }, { mask: '(00) 00000-0000' }]}
            value={whatsapp}
            onAccept={(value: any) => setWhatsapp(value)}
            name="whatsapp"
            id="whatsapp"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
            placeholder="(00) 00000-0000"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="dataNascimento" className="block text-sm font-medium text-gray-700">
            Data de Nascimento
          </label>
          <IMaskInput
            mask="00/00/0000"
            value={dataNascimento}
            onAccept={(value: any) => setDataNascimento(value)}
            name="dataNascimento"
            id="dataNascimento"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
            placeholder="DD/MM/AAAA"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            E-mail
          </label>
          <input
            type="email"
            name="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
            placeholder="exemplo@email.com"
          />
        </div>
      </div>
      
      {isEditMode && (
        <div className="flex items-center">
          <input 
            type="checkbox" 
            id="status" 
            name="status" 
            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
            checked={status === 'Inativo'}
            onChange={handleStatusChange}
          />
          <label htmlFor="status" className="ml-2 block text-sm text-gray-900">Inativar Paciente</label>
        </div>
      )}

      <div className="pt-6 flex items-center justify-end space-x-3">
        <button
          type="button"
          onClick={handleCancel}
          className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isSubmitting ? (isEditMode ? 'Salvando Alterações...' : 'Cadastrando Paciente...') : (isEditMode ? 'Salvar Alterações' : 'Cadastrar Paciente')}
        </button>
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Inativar {nome}?</h3>
            <div className="flex justify-end space-x-3">
              <button onClick={cancelInativar} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors">Cancelar</button>
              <button onClick={confirmInativar} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">Inativar</button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}