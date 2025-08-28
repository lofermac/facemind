import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { PlusIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';

interface Tarefa {
  id: string;
  user_id: string;
  descricao: string;
  is_completa: boolean;
}

export default function QuickTasksWidget() {
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [novaTarefa, setNovaTarefa] = useState('');
  const [loading, setLoading] = useState(false);
  const [completingIds, setCompletingIds] = useState<Set<string>>(new Set());

  const carregarTarefas = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setTarefas([]);
      return;
    }
    const { data, error } = await supabase
      .from('tarefas')
      .select('id, user_id, descricao, is_completa')
      .eq('user_id', user.id)
      .eq('is_completa', false)
      .order('id', { ascending: false });
    if (!error && Array.isArray(data)) {
      setTarefas(data as Tarefa[]);
    }
  }, []);

  useEffect(() => {
    carregarTarefas();
  }, [carregarTarefas]);

  const adicionarTarefa = async () => {
    const descricao = novaTarefa.trim();
    if (!descricao) return;
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    const { error } = await supabase
      .from('tarefas')
      .insert({ user_id: user.id, descricao, is_completa: false });
    setLoading(false);
    if (!error) {
      setNovaTarefa('');
      carregarTarefas();
    }
  };

  const concluirTarefa = async (id: string) => {
    console.log('Tentando concluir tarefa:', id);
    // Marca visualmente como concluída antes de remover
    setCompletingIds(prev => new Set(prev).add(id));
    
    try {
      const { error } = await supabase
        .from('tarefas')
        .update({ is_completa: true })
        .eq('id', id);
      
      if (error) {
        console.error('Erro ao concluir tarefa:', error);
        // Remove do estado de completing se houver erro
        setCompletingIds(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        return;
      }
      
      console.log('Tarefa concluída com sucesso:', id);
      // Pequeno delay para permitir a animação de conclusão
      setTimeout(() => {
        setTarefas((prev) => prev.filter((t) => t.id !== id));
        setCompletingIds(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }, 500); // Aumentei o delay para ver melhor a animação
    } catch (err) {
      console.error('Erro inesperado:', err);
      setCompletingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const deletarTarefa = async (id: string) => {
    const { error } = await supabase
      .from('tarefas')
      .delete()
      .eq('id', id);
    if (!error) {
      setTarefas(prev => prev.filter(t => t.id !== id));
    }
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      adicionarTarefa();
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-2xl p-6 sm:p-8 h-full min-h-[340px] transition-all duration-200 ease-in-out ring-1 ring-slate-200">
      <div className="mb-2">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <ClipboardDocumentCheckIcon className="w-6 h-6 text-blue-600" />
          Tarefas Rápidas
        </h3>
      </div>
      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={novaTarefa}
          onChange={(e) => setNovaTarefa(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="O que você precisa lembrar?"
          className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
        <button
          onClick={adicionarTarefa}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-5 py-2.5 text-sm font-semibold shadow hover:shadow-md active:scale-[0.99] disabled:opacity-50"
        >
          <PlusIcon className="h-5 w-5" />
          Adicionar
        </button>
      </div>
      <div className="mt-5">
        <ul className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {tarefas.map((t) => {
            const isCompleting = completingIds.has(t.id);
            return (
              <li
                key={t.id}
                className={`group relative overflow-hidden rounded-xl bg-gradient-to-r from-white to-slate-50 border border-slate-200 shadow-sm hover:shadow-md hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 ${isCompleting ? 'opacity-60 scale-95' : ''}`}
              >
                <div className="flex items-center justify-center gap-3 p-4 min-h-[60px]">
                  <div className="flex-shrink-0 flex items-center justify-center">
                    <span className="text-sm">⚫</span>
                  </div>
                  
                  <div className={`flex-1 flex items-center ${isCompleting ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                    <p className="text-sm font-medium leading-relaxed w-full">{t.descricao}</p>
                  </div>
                  
                  <div className="flex-shrink-0 flex items-center justify-center">
                    <button
                      aria-label="Concluir tarefa"
                      onClick={() => concluirTarefa(t.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 rounded-full bg-green-50 hover:bg-green-100 hover:scale-110 transition-all duration-200 flex items-center justify-center"
                      title="Marcar como concluída"
                    >
                      <span className="text-lg">✅</span>
                    </button>
                  </div>
                </div>
                
                {/* Linha decorativa */}
                <div className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
              </li>
            );
          })}
          {tarefas.length === 0 && (
            <li className="py-0">
              <div className="flex min-h-[220px] items-center justify-center text-center flex-col">
                <span className="text-4xl" role="img" aria-label="anotacao">📝</span>
                <p className="mt-3 text-sm text-slate-500 italic">Sem tarefas. Adicione uma.</p>
              </div>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}


