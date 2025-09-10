// components/ProcedimentoValorFormModal.tsx
'use client';

console.log('ProcedimentoValorFormModal.tsx carregado - VERSÃO COM DURACAO_EFEITO_MESES (Instrução 18 Completa)');

import React, { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabaseClient'; 
import { toast } from 'sonner';

// Esta interface é usada internamente e para a prop procedimentoParaEditar.
// Certifique-se que a interface ProcedimentoValor exportada de 
// '@/app/tabela-valores/[categoriaId]/page' também seja atualizada se você a usa em outros lugares.
export interface ProcedimentoValorModalData { 
  id?: string;
  nome_procedimento: string;
  valor_pix: number | null;
  valor_4x: number | null;
  valor_6x: number | null;
  observacoes?: string | null;
  duracao_efeito_meses?: number | null; 
  // Campos que vêm da tabela mas não são editados diretamente no modal (como created_at, categoria_id)
  // podem ser omitidos aqui se não forem usados no formulário do modal.
  created_at?: string;
  categoria_id?: string;
  user_id?: string;
}

interface ProcedimentoValorFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProcedimentoValorSaved: () => void;
  categoriaId: string | null; 
  procedimentoParaEditar?: ProcedimentoValorModalData | null; 
}

export default function ProcedimentoValorFormModal({
  isOpen,
  onClose,
  onProcedimentoValorSaved,
  categoriaId,
  procedimentoParaEditar,
}: ProcedimentoValorFormModalProps) {
  const [nomeProcedimento, setNomeProcedimento] = useState('');
  const [valorPix, setValorPix] = useState<string>(''); 
  const [valor4x, setValor4x] = useState<string>('');   
  const [valor6x, setValor6x] = useState<string>('');   
  const [observacoes, setObservacoes] = useState('');
  const [duracaoEfeitoMeses, setDuracaoEfeitoMeses] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = !!procedimentoParaEditar && !!procedimentoParaEditar.id;

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && procedimentoParaEditar) {
        setNomeProcedimento(procedimentoParaEditar.nome_procedimento || '');
        setValorPix(procedimentoParaEditar.valor_pix?.toString() || '');
        setValor4x(procedimentoParaEditar.valor_4x?.toString() || '');
        setValor6x(procedimentoParaEditar.valor_6x?.toString() || '');
        setObservacoes(procedimentoParaEditar.observacoes || '');
        setDuracaoEfeitoMeses(procedimentoParaEditar.duracao_efeito_meses?.toString() || '');
      } else {
        setNomeProcedimento('');
        setValorPix('');
        setValor4x('');
        setValor6x('');
        setObservacoes('');
        setDuracaoEfeitoMeses('');
      }
    }
  }, [isOpen, procedimentoParaEditar, isEditMode]);

  if (!isOpen) return null;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Você precisa estar logado para realizar esta ação.');
      setIsSubmitting(false);
      return;
    }

    if (!nomeProcedimento.trim()) {
      toast.error("Nome do procedimento é obrigatório.");
      setIsSubmitting(false);
      return;
    }
    if (!categoriaId) {
      toast.error("ID da Categoria não encontrado. Não é possível salvar.");
      setIsSubmitting(false);
      return;
    }

    const duracaoMesesParsed = duracaoEfeitoMeses.trim() ? parseInt(duracaoEfeitoMeses, 10) : null;
    if (duracaoEfeitoMeses.trim() && (isNaN(duracaoMesesParsed as any) || (duracaoMesesParsed as any) < 0)) {
        toast.error("Duração do efeito deve ser um número positivo ou vazio.");
        setIsSubmitting(false);
        return;
    }

    const dadosParaSalvar: ProcedimentoValorModalData = {
      ...(isEditMode && procedimentoParaEditar ? procedimentoParaEditar : {} as ProcedimentoValorModalData),
      user_id: user.id,
      nome_procedimento: nomeProcedimento.trim(),
      valor_pix: valorPix.trim() ? parseFloat(valorPix) : null,
      valor_4x: valor4x.trim() ? parseFloat(valor4x) : null,
      valor_6x: valor6x.trim() ? parseFloat(valor6x) : null,
      observacoes: observacoes.trim() || null,
      duracao_efeito_meses: duracaoMesesParsed,
      categoria_id: categoriaId,
    };

    let errorObj = null;

    if (isEditMode && procedimentoParaEditar) {
      const { error } = await supabase
        .from('procedimentos_tabela_valores')
        .update(dadosParaSalvar)
        .eq('id', procedimentoParaEditar.id as string);
      errorObj = error;
    } else {
      const { error } = await supabase
        .from('procedimentos_tabela_valores')
        .insert([dadosParaSalvar]);
      errorObj = error;
    }

    setIsSubmitting(false);
    if (errorObj) {
      toast.error(`Erro ao salvar: ${errorObj.message}`);
    } else {
      toast.success(`Item da tabela de valores ${isEditMode ? 'atualizado' : 'criado'} com sucesso!`);
      onProcedimentoValorSaved();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-100 bg-opacity-80 overflow-y-auto h-full w-full z-50 flex justify-center items-center px-4">
      <div className="relative mx-auto w-full max-w-2xl bg-white rounded-2xl shadow-lg border border-slate-200">
        {/* Header do Modal */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h3 className="text-2xl font-bold text-slate-900">
              {isEditMode ? 'Editar Item da Tabela' : 'Novo Item na Tabela'}
            </h3>
            <p className="text-slate-600 text-sm mt-1">
              {isEditMode ? 'Atualize as informações do procedimento' : 'Adicione um novo procedimento à tabela de valores'}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 transition-colors" 
            disabled={isSubmitting} 
            aria-label="Fechar modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Conteúdo do Modal */}
        <div className="p-6">

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="nome-procedimento-tv" className="block text-sm font-medium text-slate-700 mb-2">
                Nome do Procedimento <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                name="nome-procedimento-tv" 
                id="nome-procedimento-tv" 
                value={nomeProcedimento} 
                onChange={(e) => setNomeProcedimento(e.target.value)} 
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900" 
                autoComplete="off" 
                inputMode="text" 
                placeholder="Ex: Aplicação de Toxina - Testa Completa" 
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="valor-pix-tv" className="block text-sm font-medium text-slate-700 mb-2">Valor Pix</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 font-medium">R$</span>
                  <input 
                    type="number" 
                    name="valor-pix-tv" 
                    id="valor-pix-tv" 
                    value={valorPix} 
                    onChange={(e) => setValorPix(e.target.value)} 
                    step="0.01" 
                    min="0"
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                    inputMode="decimal" 
                    autoComplete="off" 
                    placeholder="150.00" 
                  />
                </div>
              </div>
              <div>
                <label htmlFor="valor-4x-tv" className="block text-sm font-medium text-slate-700 mb-2">Valor 4x</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 font-medium">R$</span>
                  <input 
                    type="number" 
                    name="valor-4x-tv" 
                    id="valor-4x-tv" 
                    value={valor4x} 
                    onChange={(e) => setValor4x(e.target.value)} 
                    step="0.01" 
                    min="0"
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                    inputMode="decimal" 
                    autoComplete="off" 
                    placeholder="160.00" 
                  />
                </div>
              </div>
              <div>
                <label htmlFor="valor-6x-tv" className="block text-sm font-medium text-slate-700 mb-2">Valor 6x</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 font-medium">R$</span>
                  <input 
                    type="number" 
                    name="valor-6x-tv" 
                    id="valor-6x-tv" 
                    value={valor6x} 
                    onChange={(e) => setValor6x(e.target.value)} 
                    step="0.01" 
                    min="0"
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                    inputMode="decimal" 
                    autoComplete="off" 
                    placeholder="165.00" 
                  />
                </div>
              </div>
            </div>
          
            <div>
              <label htmlFor="duracao-efeito-meses-tv" className="block text-sm font-medium text-slate-700 mb-2">
                Duração do Efeito (meses)
              </label>
              <input
                type="number"
                name="duracao-efeito-meses-tv"
                id="duracao-efeito-meses-tv"
                value={duracaoEfeitoMeses}
                onChange={(e) => setDuracaoEfeitoMeses(e.target.value)}
                min="0"
                step="1"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900" 
                inputMode="numeric" 
                autoComplete="off" 
                placeholder="Ex: 6"
              />
               <p className="mt-2 text-xs text-slate-500">Deixe em branco ou 0 se não aplicável.</p>
            </div>

            <div>
              <label htmlFor="observacoes-procedimento-tv" className="block text-sm font-medium text-slate-700 mb-2">
                Observações (Opcional)
              </label>
              <textarea 
                name="observacoes-procedimento-tv" 
                id="observacoes-procedimento-tv" 
                rows={3} 
                value={observacoes} 
                onChange={(e) => setObservacoes(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none" 
                placeholder="Detalhes sobre este item..."
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button 
                type="button" 
                onClick={onClose} 
                disabled={isSubmitting} 
                className="px-6 py-2 border border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting} 
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Salvando..." : (isEditMode ? "Salvar Alterações" : "Adicionar Item")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}