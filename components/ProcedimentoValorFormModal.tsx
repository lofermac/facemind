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
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex justify-center items-center px-4">
      <div className="relative mx-auto p-6 border w-full max-w-lg shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-xl font-semibold text-gray-900">
            {isEditMode ? 'Editar Item da Tabela' : 'Novo Item na Tabela'}
          </h3>
          <button onClick={onClose} className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center" disabled={isSubmitting} aria-label="Fechar modal">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="nome-procedimento-tv" className="block text-sm font-medium text-gray-700">
              Nome do Procedimento <span className="text-red-500">*</span>
            </label>
            <input type="text" name="nome-procedimento-tv" id="nome-procedimento-tv" value={nomeProcedimento} onChange={(e) => setNomeProcedimento(e.target.value)} required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-base md:text-sm" autoComplete="off" inputMode="text" placeholder="Ex: Aplicação de Toxina - Testa Completa" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="valor-pix-tv" className="block text-sm font-medium text-gray-700">Valor Pix</label>
              <input type="number" name="valor-pix-tv" id="valor-pix-tv" value={valorPix} onChange={(e) => setValorPix(e.target.value)} step="0.01" min="0"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-base md:text-sm" inputMode="decimal" autoComplete="off" pattern="[0-9]*" style={{ WebkitAppearance: 'none' }} placeholder="Ex: 150.00" />
            </div>
            <div>
              <label htmlFor="valor-4x-tv" className="block text-sm font-medium text-gray-700">Valor 4x</label>
              <input type="number" name="valor-4x-tv" id="valor-4x-tv" value={valor4x} onChange={(e) => setValor4x(e.target.value)} step="0.01" min="0"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-base md:text-sm" inputMode="decimal" autoComplete="off" pattern="[0-9]*" style={{ WebkitAppearance: 'none' }} placeholder="Ex: 160.00" />
            </div>
            <div>
              <label htmlFor="valor-6x-tv" className="block text-sm font-medium text-gray-700">Valor 6x</label>
              <input type="number" name="valor-6x-tv" id="valor-6x-tv" value={valor6x} onChange={(e) => setValor6x(e.target.value)} step="0.01" min="0"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-base md:text-sm" inputMode="decimal" autoComplete="off" pattern="[0-9]*" style={{ WebkitAppearance: 'none' }} placeholder="Ex: 165.00" />
            </div>
          </div>
          
          <div>
            <label htmlFor="duracao-efeito-meses-tv" className="block text-sm font-medium text-gray-700">
              Duração do Efeito (meses)
            </label>
            <input
              type="number"
              name="duracao-efeito-meses-tv"
              id="duracao-efeito-meses-tv"
              value={duracaoEfeitoMeses}
              onChange={(e) => setDuracaoEfeitoMeses(e.target.value)}
              min="0"
              step="1" // Meses inteiros
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-base md:text-sm" inputMode="numeric" autoComplete="off" pattern="[0-9]*" style={{ WebkitAppearance: 'none' }}
              placeholder="Ex: 6"
            />
             <p className="mt-1 text-xs text-gray-500">Deixe em branco ou 0 se não aplicável.</p>
          </div>

          <div>
            <label htmlFor="observacoes-procedimento-tv" className="block text-sm font-medium text-gray-700">
              Observações (Opcional)
            </label>
            <textarea name="observacoes-procedimento-tv" id="observacoes-procedimento-tv" rows={3} value={observacoes} onChange={(e) => setObservacoes(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-base md:text-sm resize-y min-h-[56px] md:min-h-[40px]" placeholder="Detalhes sobre este item..."></textarea>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 mt-5">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 border border-transparent rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50">
              {isSubmitting ? "Salvando..." : (isEditMode ? "Salvar Alterações" : "Adicionar Item")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}