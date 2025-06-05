// components/PatientFormModal.tsx
'use client';

console.log('PatientFormModal.tsx carregado - VERSÃO INTERFACE PACIENTE CORRIGIDA');

import React, { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabaseClient'; 
import { IMaskInput } from 'react-imask';
import { toast } from 'sonner';

// ✨ INTERFACE ATUALIZADA ✨
interface Paciente {
  id: string;
  created_at: string;
  nome: string;
  data_nascimento: string | null; 
  cpf: string | null;
  whatsapp: string | null;
  email: string | null;
  status: string | null;
  observacoes?: string | null; // Tornando opcional para bater com a página
}

interface PatientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPatientSaved: () => void;
  pacienteParaEditar?: Paciente | null; // Agora usa a interface Paciente atualizada
}

export default function PatientFormModal({ isOpen, onClose, onPatientSaved, pacienteParaEditar }: PatientFormModalProps) {
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState(''); 
  const [dataNascimento, setDataNascimento] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [status, setStatus] = useState('Ativo');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = !!pacienteParaEditar;

  useEffect(() => {
    if (isEditMode && pacienteParaEditar) {
      setNome(pacienteParaEditar.nome || '');
      setCpf(pacienteParaEditar.cpf || '');
      const dataNascOriginal = pacienteParaEditar.data_nascimento;
      if (dataNascOriginal && typeof dataNascOriginal === 'string') {
        const dateParts = dataNascOriginal.split('-');
        if (dateParts.length === 3 && dateParts[0].length === 4 && dateParts[1].length === 2 && dateParts[2].length === 2) {
          setDataNascimento(dateParts[2] + "/" + dateParts[1] + "/" + dateParts[0]);
        } else { setDataNascimento(''); }
      } else { setDataNascimento(''); }
      setWhatsapp(pacienteParaEditar.whatsapp || '');
      setEmail(pacienteParaEditar.email || '');
      setObservacoes(pacienteParaEditar.observacoes || ''); // Se for undefined, vira ''
      setStatus(pacienteParaEditar.status || 'Ativo');
    } else {
      setNome(''); setCpf(''); setDataNascimento('');
      setWhatsapp(''); setEmail(''); setObservacoes('');
      setStatus('Ativo');
    }
  }, [isOpen, pacienteParaEditar, isEditMode]);

  if (!isOpen) return null;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    let errors: string[] = [];

    const cpfValorAtual = cpf; 
    const emailTrimmed = email.trim();
    
    if (!nome.trim()) errors.push("Nome é obrigatório.");
    if (!cpfValorAtual.trim()) errors.push("CPF é obrigatório.");
    if (!dataNascimento.trim()) errors.push("Data de Nascimento é obrigatória.");

    const cpfApenasNumeros = cpfValorAtual.replace(/\D/g, '');
    if (cpfValorAtual.trim() && cpfApenasNumeros.length !== 11) {
      errors.push("CPF deve conter 11 dígitos.");
    }

    let dataNascimentoParaSalvar: string | null = null;
    if (dataNascimento.trim()) {
      const parts = dataNascimento.split('/'); 
      if (parts.length === 3 && parts[0].length === 2 && parts[1].length === 2 && parts[2].length === 4) {
        const diaOriginalStr = parts[0]; const mesOriginalStr = parts[1]; const anoOriginalStr = parts[2];
        const diaInt = parseInt(diaOriginalStr, 10); const mesInt = parseInt(mesOriginalStr, 10) -1; const anoInt = parseInt(anoOriginalStr, 10);
        const dataObj = new Date(anoInt, mesInt, diaInt); const hoje = new Date(); hoje.setHours(0,0,0,0);
        if (isNaN(dataObj.getTime()) || dataObj.getDate() !== diaInt || dataObj.getMonth() !== mesInt || dataObj.getFullYear() !== anoInt) {
          errors.push("Data de Nascimento inválida.");
        } else if (dataObj > hoje && dataObj.toDateString() !== hoje.toDateString()) { 
          errors.push("Data de Nascimento não pode ser uma data futura.");
        } else {
          dataNascimentoParaSalvar = anoOriginalStr + "-" + mesOriginalStr.padStart(2, '0') + "-" + diaOriginalStr.padStart(2, '0');
        }
      } else { errors.push("Formato da Data de Nascimento inválido. Use DD/MM/AAAA."); }
    }
    
    if (emailTrimmed) { 
      const emailRegexHTML5 = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
      const isEmailValid = emailRegexHTML5.test(emailTrimmed);
      if (!isEmailValid) {
        errors.push("Formato de e-mail inválido.");
      }
    }

    if (errors.length > 0) {
      toast.error(errors.join(" "));
      setIsSubmitting(false);
      return;
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      toast.error('Você precisa estar logado para realizar esta ação.');
      setIsSubmitting(false);
      return;
    }

    const dadosPaciente = {
      nome: nome.trim(), 
      cpf: cpfApenasNumeros, // Salva apenas os números
      data_nascimento: dataNascimentoParaSalvar,
      whatsapp: whatsapp.trim() || null, 
      email: emailTrimmed || null,
      observacoes: observacoes.trim() || null, 
      status: status,
      user_id: user.id
    };

    let errorObj = null; 
    if (isEditMode && pacienteParaEditar) {
      const { error } = await supabase.from('pacientes').update(dadosPaciente).eq('id', pacienteParaEditar.id);
      errorObj = error;
    } else {
      const { error } = await supabase.from('pacientes').insert([dadosPaciente]);
      errorObj = error;
    }

    setIsSubmitting(false);
    if (errorObj) {
      toast.error(`Erro ao salvar: ${errorObj.message || "Ocorreu um erro desconhecido."}`);
    } else {
      toast.success(`Paciente ${isEditMode ? 'editado' : 'cadastrado'} com sucesso!`);
      onPatientSaved();
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex justify-center items-center px-4">
      <div className="relative mx-auto p-6 border w-full max-w-lg shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-xl font-semibold text-gray-900">
            {isEditMode ? 'Editar Paciente' : 'Novo Paciente'}
          </h3>
          <button onClick={onClose} className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center" disabled={isSubmitting}>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* JSX dos campos do formulário ... */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="nome" className="block text-sm font-medium text-gray-700">Nome <span className="text-red-500">*</span></label>
              <input type="text" name="nome" id="nome" value={nome} onChange={(e) => setNome(e.target.value)} required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Nome completo" />
            </div>
            <div>
              <label htmlFor="cpf" className="block text-sm font-medium text-gray-700">CPF <span className="text-red-500">*</span></label>
              <IMaskInput
                mask="000.000.000-00" value={cpf} onAccept={(value: any) => setCpf(value)} required
                name="cpf" id="cpf"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="000.000.000-00"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="dataNascimento" className="block text-sm font-medium text-gray-700">Data de Nascimento <span className="text-red-500">*</span></label>
              <IMaskInput
                mask="00/00/0000" value={dataNascimento} onAccept={(value: any) => setDataNascimento(value)} required
                name="dataNascimento" id="dataNascimento"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="dd/mm/aaaa"
              />
            </div>
            <div>
              <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700">WhatsApp</label>
              <IMaskInput
                mask="(00) 00000-0000" value={whatsapp} onAccept={(value: any) => setWhatsapp(value)}
                name="whatsapp" id="whatsapp"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">E-mail</label>
            <input type="email" name="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="email@exemplo.com" />
          </div>
          <div>
            <label htmlFor="observacoes" className="block text-sm font-medium text-gray-700">Observações</label>
            <textarea name="observacoes" id="observacoes" value={observacoes} onChange={(e) => setObservacoes(e.target.value)} rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Digite observações..."></textarea>
          </div>
          {isEditMode && (
            <div className="flex items-center">
              <input id="inativar" name="inativar" type="checkbox"
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                checked={status === 'Inativo'} onChange={(e) => setStatus(e.target.checked ? 'Inativo' : 'Ativo')}
              />
              <label htmlFor="inativar" className="ml-2 block text-sm text-gray-900">Inativar paciente</label>
            </div>
          )}
          {!isEditMode && (
             <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                <select id="status" name="status" value={status} onChange={(e) => setStatus(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                <option value="Ativo">Ativo</option>
                <option value="Inativo">Inativo</option>
                </select>
            </div>
          )}
          <div className="flex items-center justify-end space-x-3 pt-5 border-t border-gray-200 mt-6">
            <button type="button" onClick={onClose} disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >Cancelar</button>
            <button type="submit" disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 border border-transparent rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >{isSubmitting ? "Salvando..." : (isEditMode ? "Salvar Alterações" : "Cadastrar Paciente")}</button>
          </div>
        </form>
      </div>
    </div>
  );
}