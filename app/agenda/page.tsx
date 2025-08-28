'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRef } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { Suspense } from 'react';

// Semana começando na segunda-feira
const weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

function getMonthMatrix(year: number, month: number) {
  // Ajuste para semana começando na segunda
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const matrix = [];
  let week = [];
  // O dia da semana (0=domingo, 1=segunda, ...) ajustado para segunda ser 0
  let day = 1 - ((firstDay.getDay() + 6) % 7);
  for (let i = 0; i < 6; i++) {
    week = [];
    for (let j = 0; j < 7; j++) {
      const d = new Date(year, month, day);
      week.push(d.getMonth() === month ? d.getDate() : '');
      day++;
    }
    matrix.push(week);
  }
  return matrix;
}

function getWeekDays(date: Date) {
  // Começa na segunda-feira
  const start = new Date(date);
  const dayOfWeek = (start.getDay() + 6) % 7; // 0=segunda, 6=domingo
  start.setDate(date.getDate() - dayOfWeek);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

function ModalAgendamento({ open, onClose, data, hora, onAgendamentoSalvo, agendamentoEditavel }: { open: boolean, onClose: () => void, data: string, hora: string, onAgendamentoSalvo: () => void, agendamentoEditavel?: any }) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [pacientes, setPacientes] = useState<{ id: string, nome: string }[]>([]);
  const [pacienteSelecionado, setPacienteSelecionado] = useState('');
  const [duracao, setDuracao] = useState(60);
  const [rotulo, setRotulo] = useState('');
  const [erroRotulo, setErroRotulo] = useState('');
  const [enviarConfirmacao, setEnviarConfirmacao] = useState(true);
  const [observacao, setObservacao] = useState('');
  const [loading, setLoading] = useState(false);
  const [dataLocal, setDataLocal] = useState(data);
  // Estado para controle de hora com setas (minutos desde 00:00)
  const [horaMinutos, setHoraMinutos] = useState<number>(() => {
    if (agendamentoEditavel?.hora) {
      const [hh, mm] = agendamentoEditavel.hora.split(':');
      return parseInt(hh, 10) * 60 + parseInt(mm, 10);
    }
    if (hora) {
      const [hh, mm] = hora.split(':');
      return parseInt(hh, 10) * 60 + parseInt(mm, 10);
    }
    return 7 * 60; // 07:00
  });
  function clampHora(mins: number) {
    return Math.min(Math.max(mins, 7 * 60), 20 * 60); // 07:00 a 20:00
  }
  function formatHora(mins: number) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }

  useEffect(() => {
    if (open) {
      supabase
        .from('pacientes')
        .select('id, nome')
        .order('nome', { ascending: true })
        .then(({ data, error }) => {
          if (!error && Array.isArray(data)) setPacientes(data);
          else setPacientes([]);
        });
      if (agendamentoEditavel) {
        setPacienteSelecionado(agendamentoEditavel.paciente_id?.toString() || '');
        setDuracao(agendamentoEditavel.duracao_min || 60);
        setRotulo(agendamentoEditavel.rotulo || '');
        setEnviarConfirmacao(agendamentoEditavel.enviar_whatsapp === true || agendamentoEditavel.enviar_whatsapp === 'true');
        setObservacao(agendamentoEditavel.observacao || '');
        setDataLocal(agendamentoEditavel.data || data);
        if (agendamentoEditavel.hora) {
          const [hh, mm] = agendamentoEditavel.hora.split(':');
          setHoraMinutos(parseInt(hh, 10) * 60 + parseInt(mm, 10));
        }
      } else {
        setPacienteSelecionado('');
        setDuracao(60);
        setRotulo('');
        setEnviarConfirmacao(true);
        setObservacao('');
        setDataLocal(data);
        if (hora) {
          const [hh, mm] = hora.split(':');
          setHoraMinutos(parseInt(hh, 10) * 60 + parseInt(mm, 10));
        } else {
          setHoraMinutos(7 * 60);
        }
      }
    }
  }, [open, agendamentoEditavel, hora]);

  if (!open) return null;

  async function handleDelete() {
    if (!agendamentoEditavel) return;
    if (confirm('Tem certeza que deseja excluir este agendamento?')) {
      const { error } = await supabase.from('agendamentos').delete().eq('id', agendamentoEditavel.id);
      if (!error) {
        onClose();
        onAgendamentoSalvo();
      } else {
        alert('Erro ao excluir agendamento: ' + error.message);
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div ref={overlayRef} className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-fade-in">
        <div className="flex gap-2 mb-6 justify-center">
          <button className="px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-semibold">Agendamento</button>
        </div>
        <form className="space-y-4" onSubmit={async e => {
          e.preventDefault();
          if (!rotulo) {
            setErroRotulo('Selecione Procedimento ou Retorno.');
            return;
          }
          setErroRotulo('');
          setLoading(true);
          let error;
          if (agendamentoEditavel) {
            // Modo edição - atualizar agendamento existente
            const result = await supabase.from('agendamentos')
              .update({
                paciente_id: pacienteSelecionado,
                data: dataLocal,
                hora: formatHora(horaMinutos),
                duracao_min: duracao,
                observacao,
                enviar_whatsapp: enviarConfirmacao,
                rotulo,
              })
              .eq('id', agendamentoEditavel.id);
            error = result.error;
          } else {
            // Modo criação - inserir novo agendamento
            const result = await supabase.from('agendamentos').insert([{
              paciente_id: pacienteSelecionado,
              data: dataLocal,
              hora: formatHora(horaMinutos),
              duracao_min: duracao,
              observacao,
              enviar_whatsapp: enviarConfirmacao,
              rotulo,
            }]);
            error = result.error;
          }
          setLoading(false);
          if (!error) {
            onClose();
            onAgendamentoSalvo();
          } else {
            alert('Erro ao salvar agendamento: ' + error.message);
          }
        }}>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Paciente<span className="text-red-500">*</span></label>
            <select
              className="w-full border-2 border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400"
              value={pacienteSelecionado}
              onChange={e => setPacienteSelecionado(e.target.value)}
              required
            >
              <option value="" disabled hidden>Selecione</option>
              {pacientes.map(p => (
                <option key={p.id} value={p.id}>{p.nome}</option>
              ))}
            </select>
            {/* Removido o link de cadastrar novo paciente */}
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Data<span className="text-red-500">*</span></label>
              <input 
                type="date" 
                className="w-full border-2 border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400" 
                value={dataLocal} 
                onChange={e => setDataLocal(e.target.value)}
                readOnly={!agendamentoEditavel} 
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Hora<span className="text-red-500">*</span></label>
              <div className="relative group">
                <input
                  type="text"
                  className="w-full border-2 border-slate-200 rounded-lg px-3 py-2 pr-8 focus:outline-none focus:border-blue-400"
                  value={formatHora(horaMinutos)}
                  readOnly
                />
                <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-[3px] text-slate-400 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
                  <button
                    type="button"
                    aria-label="Aumentar"
                    className="pointer-events-auto w-3 h-3 flex items-center justify-center p-0 m-0 bg-transparent border-0 text-slate-400 hover:text-slate-600"
                    onClick={() => setHoraMinutos(prev => clampHora(prev + 15))}
                  >
                    <svg viewBox="0 0 20 20" className="w-3 h-3" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 12l5-5 5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    aria-label="Diminuir"
                    className="pointer-events-auto w-3 h-3 flex items-center justify-center p-0 m-0 bg-transparent border-0 text-slate-400 hover:text-slate-600"
                    onClick={() => setHoraMinutos(prev => clampHora(prev - 15))}
                  >
                    <svg viewBox="0 0 20 20" className="w-3 h-3" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 8l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Duração<span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  type="number"
                  className="w-full border-2 border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400 pr-10"
                  min={15}
                  max={120}
                  step={15}
                  value={duracao}
                  onChange={e => setDuracao(Number(e.target.value))}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  onKeyDown={e => e.preventDefault()}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none select-none">min</span>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Observação</label>
            <textarea className="w-full border-2 border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400 resize-none" maxLength={500} rows={2} placeholder="" value={observacao} onChange={e => setObservacao(e.target.value)}></textarea>
            <div className="text-xs text-slate-400 text-right">0 / 500</div>
          </div>
          <div className="flex items-center gap-2 hidden">
            <input
              type="checkbox"
              id="confirma"
              className="accent-blue-600 w-4 h-4"
              checked={enviarConfirmacao}
              onChange={e => setEnviarConfirmacao(e.target.checked)}
            />
            <label htmlFor="confirma" className="text-sm text-slate-700">
              <span className="font-bold">Confirmação</span> e <span className="font-bold">Lembrete</span> via <span className="font-bold" style={{ color: '#25D366' }}>WhatsApp</span>
            </label>
          </div>
          {/* Substituir select de rótulo por botões */}
          <div className="flex gap-4 mt-2 mb-2">
            <button
              type="button"
              className={`flex-1 py-3 rounded-lg border text-base font-medium transition-all
                ${rotulo === 'Procedimento' ? 'bg-blue-600 text-white border-blue-600 shadow' : 'bg-white text-slate-700 border-slate-200 hover:bg-blue-50'}`}
              onClick={() => { setRotulo('Procedimento'); setErroRotulo(''); }}
            >
              Procedimento
            </button>
            <button
              type="button"
              className={`flex-1 py-3 rounded-lg border text-base font-medium transition-all
                ${rotulo === 'Retorno' ? 'bg-green-600 text-white border-green-600 shadow' : 'bg-white text-slate-700 border-slate-200 hover:bg-green-50'}`}
              onClick={() => { setRotulo('Retorno'); setErroRotulo(''); }}
            >
              Retorno
            </button>
          </div>
          {erroRotulo && <div className="text-red-500 text-sm mb-2">{erroRotulo}</div>}
          <div className="flex justify-end gap-2 mt-6">
            {agendamentoEditavel && (
              <button type="button" onClick={handleDelete} className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700">Excluir</button>
            )}
            <div className="flex flex-1 justify-end gap-2">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200">Fechar</button>
              <button type="submit" className="px-4 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700" disabled={loading}>
                {loading ? 'Salvando...' : (agendamentoEditavel ? 'Alterar' : 'Marcar')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function AgendaPageContent() {
  const searchParams = useSearchParams();
  const initialDateParam = searchParams?.get('date');
  
  // Criar data de forma segura para evitar problemas de fuso horário
  const initialDate = initialDateParam ? (() => {
    const [year, month, day] = initialDateParam.split('-').map(Number);
    return new Date(year, month - 1, day); // month - 1 porque Date usa 0-based months
  })() : new Date();
  
  const [view, setView] = useState<'month' | 'week'>('week');
  const [current, setCurrent] = useState(initialDate);
  const [modal, setModal] = useState<{ open: boolean, data: string, hora: string }>({ open: false, data: '', hora: '' });
  const [agendamentos, setAgendamentos] = useState([]);
  const [pacientesMap, setPacientesMap] = useState<{ [id: string]: string }>({});
  const [agendamentoEditavel, setAgendamentoEditavel] = useState(null);

  // Função para abrir modal ao clicar em horário
  function handleAgendamentoClick(agendamento) {
    setModal({ open: true, data: agendamento.data, hora: agendamento.hora });
    setAgendamentoEditavel(agendamento);
  }
  function handleHorarioClick(date: Date, hour: number) {
    setModal({ open: true, data: date.toISOString().slice(0, 10), hora: hour.toString().padStart(2, '0') + ':00' });
    setAgendamentoEditavel(null);
  }

  // Corrigir erro: definir as funções de navegação
  const goPrev = () => {
    if (view === 'month') {
      setCurrent(new Date(current.getFullYear(), current.getMonth() - 1, 1));
    } else {
      setCurrent(new Date(current.getFullYear(), current.getMonth(), current.getDate() - 7));
    }
  };
  const goNext = () => {
    if (view === 'month') {
      setCurrent(new Date(current.getFullYear(), current.getMonth() + 1, 1));
    } else {
      setCurrent(new Date(current.getFullYear(), current.getMonth(), current.getDate() + 7));
    }
  };
  const goToday = () => setCurrent(new Date());

  // Função para buscar agendamentos
  const fetchAgendamentos = async () => {
    // Buscar agendamentos do mês/semana visível
    const dataInicio = new Date(current);
    dataInicio.setDate(1);
    const dataFim = new Date(current.getFullYear(), current.getMonth() + 1, 0);
    const { data, error } = await supabase
      .from('agendamentos')
      .select('id, paciente_id, data, hora, duracao_min, observacao, rotulo, enviar_whatsapp')
      .gte('data', dataInicio.toISOString().slice(0, 10))
      .lte('data', dataFim.toISOString().slice(0, 10));
    if (!error && Array.isArray(data)) setAgendamentos(data);
    console.log('Agendamentos:', data); // debug
    // Buscar nomes dos pacientes
    const { data: pacientes } = await supabase
      .from('pacientes')
      .select('id, nome');
    if (Array.isArray(pacientes)) {
      const map: { [id: string]: string } = {};
      pacientes.forEach(p => { map[p.id] = p.nome; });
      setPacientesMap(map);
    }
  };

  // Buscar agendamentos quando current muda
  useEffect(() => {
    fetchAgendamentos();
  }, [current]);

  // Renderização
  return (
    <div className="max-w-5xl mx-auto py-8 px-2 md:px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Agenda</h1>
        <p className="text-slate-600 text-sm mt-1">Gerencie seus agendamentos e compromissos</p>
      </div>
      <ModalAgendamento
        open={modal.open}
        onClose={() => { setModal({ ...modal, open: false }); setAgendamentoEditavel(null); }}
        data={modal.data}
        hora={modal.hora}
        onAgendamentoSalvo={() => { fetchAgendamentos(); }}
        agendamentoEditavel={agendamentoEditavel}
      />
      <div className="bg-white rounded-xl shadow p-4 mb-8">
        {/* Header do calendário */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <button onClick={goPrev} className="rounded-full p-2 hover:bg-slate-100 text-xl">&#8592;</button>
            <span className="font-semibold text-lg">
              {current.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
            </span>
            <button onClick={goNext} className="rounded-full p-2 hover:bg-slate-100 text-xl">&#8594;</button>
            <button onClick={goToday} className="ml-2 px-2 py-1 text-xs rounded bg-slate-100 hover:bg-slate-200">Hoje</button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setView('week')}
              className={`px-3.5 py-1.5 rounded-lg font-semibold transition ${view === 'week' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50'}`}
            >
              Semana
            </button>
            <button
              onClick={() => setView('month')}
              className={`px-3.5 py-1.5 rounded-lg font-semibold transition ${view === 'month' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50'}`}
            >
              Mês
            </button>
          </div>
        </div>
        {/* Corpo do calendário */}
        {view === 'month' ? (
          <div>
            <div className="grid grid-cols-7 text-center text-slate-500 font-medium mb-2">
              {weekDays.map((d) => <div key={d}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {getMonthMatrix(current.getFullYear(), current.getMonth()).map((week, i) =>
                week.map((day, j) => {
                  const isClickable = day !== '';
                  const dayDate = new Date(current.getFullYear(), current.getMonth(), day || 1);
                  const ags = agendamentos.filter(a => {
                    const dataAg = (typeof a.data === 'string' ? a.data : new Date(a.data).toISOString().slice(0, 10));
                    const dataDia = dayDate.toISOString().slice(0, 10);
                    return dataAg === dataDia;
                  });
                  return (
                    <div
                      key={i + '-' + j}
                      className={`h-16 relative border rounded-lg ${day === '' ? 'bg-slate-50' : 'bg-white'} ${day === current.getDate() && current.getMonth() === new Date().getMonth() && current.getFullYear() === new Date().getFullYear() && day !== '' ? 'border-blue-500' : 'border-slate-200'} ${isClickable ? 'cursor-pointer hover:bg-blue-50 transition' : ''}`}
                      onClick={() => {
                        if (isClickable) {
                          setCurrent(dayDate);
                          setView('week');
                        }
                      }}
                    >
                      <div className="absolute top-1 right-1 text-sm">{day}</div>
                      {ags.length > 0 && (
                        <div className="h-full flex items-center justify-center p-2">
                          <div className="flex flex-wrap gap-1 justify-center items-center">
                            {ags
                              .sort((a, b) => (a.hora || '').localeCompare(b.hora || ''))
                              .map((a, index) => {
                                const isProcedimento = a.rotulo === 'Procedimento';
                                const bgColor = isProcedimento ? 'bg-blue-600' : 'bg-green-600';
                                const hoverColor = isProcedimento ? 'hover:bg-blue-700' : 'hover:bg-green-700';
                                
                                return (
                                  <div 
                                    key={a.id} 
                                    className={`w-2 h-2 ${bgColor} rounded-full cursor-pointer ${hoverColor} transition-colors`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAgendamentoClick(a);
                                    }}
                                    title={`${pacientesMap[a.paciente_id] || ''} - ${(a.hora || '').slice(0, 5)} - ${a.rotulo}`}
                                  />
                                );
                              })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-8 text-center text-slate-500 font-medium mb-2">
              <div></div>
              {getWeekDays(current).map((d, i) => (
                <div key={i} className="truncate">
                  <span className="font-bold">{weekDays[d.getDay() === 0 ? 6 : d.getDay() - 1]}</span><br />
                  <span className="font-normal">{d.getDate()}</span>
                </div>
              ))}
            </div>
            {/* Horas do dia */}
            <div className="grid grid-cols-8">
              {Array.from({ length: 14 }, (_, h) => 7 + h).map((hour) => (
                <React.Fragment key={hour}>
                  <div className="text-xs text-slate-400 border-r border-slate-100 flex items-center justify-end pr-2 h-12" style={{minHeight:'3rem'}}>{hour}h</div>
                  {getWeekDays(current).map((d, i) => {
                    // Enquadrar agendamento no quadrante da hora cheia correspondente
                    const ags = agendamentos.filter(a => {
                      const dataAg = (typeof a.data === 'string' ? a.data : new Date(a.data).toISOString().slice(0, 10));
                      const dataDia = d.toISOString().slice(0, 10);
                      
                      if (!a.hora) return false;
                      
                      // Pega só a hora cheia do agendamento
                      const [hStr, mStr] = a.hora.split(':');
                      const agHour = parseInt(hStr, 10);
                      
                      // Se o agendamento começa entre X:00 e X:59, ele aparece no quadrante Xh
                      return dataAg === dataDia && agHour === hour;
                    });
                    // Só renderiza o agendamento se ele começa neste horário
                    return (
                      <div key={i} className="h-12 border border-slate-100 hover:bg-blue-50 transition cursor-pointer relative" onClick={() => handleHorarioClick(d, hour)} style={{padding:0}}>
                        {ags.map(a => {
                          const nomeCompleto = pacientesMap[a.paciente_id] || '';
                          const primeiroNome = nomeCompleto.split(' ')[0] || nomeCompleto;
                          const isProcedimento = a.rotulo === 'Procedimento';
                          const bgColor = isProcedimento ? 'bg-blue-100' : 'bg-green-100';
                          const textColor = isProcedimento ? 'text-blue-800' : 'text-green-800';
                          
                          return (
                            <div
                              key={a.id}
                              className={`absolute left-1 right-1 top-1 bottom-1 ${bgColor} ${textColor} rounded px-1 py-0.5 text-xs z-10 flex flex-col items-center justify-center cursor-pointer`}
                              style={{
                                height: 'calc(100% - 0.25rem)',
                                minHeight: '24px',
                                maxHeight: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                textAlign: 'center',
                              }}
                              onClick={e => { e.stopPropagation(); handleAgendamentoClick(a); }}
                            >
                              <div className="font-bold leading-tight">{primeiroNome}</div>
                              <div className="leading-tight">{(a.hora || '').slice(0, 5)}</div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
      </div>
      {/* Bloco de "Compromissos do dia" removido conforme solicitação */}
    </div>
  );
}

export default function AgendaPage() {
  return (
    <Suspense fallback={<div>Carregando agenda...</div>}>
      <AgendaPageContent />
    </Suspense>
  );
}
