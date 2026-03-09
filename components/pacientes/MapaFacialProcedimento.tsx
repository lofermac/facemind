'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { toast } from 'sonner';

interface ProcedimentoPaciente {
  id: string;
  data_procedimento: string | null;
  observacoes?: string | null;
  procedimento_tabela_valores_id?: {
    nome_procedimento: string | null;
  } | null;
}

interface Props {
  procedimentos: ProcedimentoPaciente[];
}

type RegiaoId =
  | 'testa'
  | 'glabela'
  | 'olho_esquerdo'
  | 'olho_direito'
  | 'malar_esquerdo'
  | 'malar_direito'
  | 'nasolabial'
  | 'labios'
  | 'mento'
  | 'mandibula';

interface RegiaoData {
  feito: string;
  produto: string;
}

type MapaFacialData = Partial<Record<RegiaoId, RegiaoData>>;

interface RegiaoFace {
  id: RegiaoId;
  label: string;
  positionClass: string;
}

const REGIOES: RegiaoFace[] = [
  { id: 'testa', label: 'Testa', positionClass: 'top-9 left-1/2 -translate-x-1/2' },
  { id: 'glabela', label: 'Glabela', positionClass: 'top-[74px] left-1/2 -translate-x-1/2' },
  { id: 'olho_esquerdo', label: 'Olho E.', positionClass: 'top-[102px] left-[74px]' },
  { id: 'olho_direito', label: 'Olho D.', positionClass: 'top-[102px] right-[74px]' },
  { id: 'malar_esquerdo', label: 'Malar E.', positionClass: 'top-[132px] left-[56px]' },
  { id: 'malar_direito', label: 'Malar D.', positionClass: 'top-[132px] right-[56px]' },
  { id: 'nasolabial', label: 'Sulco NL', positionClass: 'top-[160px] left-1/2 -translate-x-1/2' },
  { id: 'labios', label: 'Lábios', positionClass: 'top-[185px] left-1/2 -translate-x-1/2' },
  { id: 'mento', label: 'Mento', positionClass: 'top-[214px] left-1/2 -translate-x-1/2' },
  { id: 'mandibula', label: 'Mandíbula', positionClass: 'top-[246px] left-1/2 -translate-x-1/2' },
];

function sortProcedimentosMaisRecentes(procedimentos: ProcedimentoPaciente[]): ProcedimentoPaciente[] {
  return [...procedimentos].sort((a, b) => {
    if (!a.data_procedimento || !b.data_procedimento) return 0;
    return new Date(b.data_procedimento).getTime() - new Date(a.data_procedimento).getTime();
  });
}

function extractMapaFacial(observacoes: string | null | undefined): MapaFacialData {
  if (!observacoes) return {};
  const match = observacoes.match(/\[MAPA_FACIAL\]([\s\S]*?)\[\/MAPA_FACIAL\]/);
  if (!match?.[1]) return {};
  try {
    const parsed = JSON.parse(match[1].trim()) as MapaFacialData;
    return parsed || {};
  } catch {
    return {};
  }
}

function mergeObservacoes(existing: string | null | undefined, mapa: MapaFacialData): string {
  const textoBase = (existing || '')
    .replace(/\n?\[MAPA_FACIAL\][\s\S]*?\[\/MAPA_FACIAL\]\n?/g, '\n')
    .trim();

  const mapaLimpo = Object.fromEntries(
    Object.entries(mapa).filter(([, value]) => {
      const feito = value?.feito?.trim() || '';
      const produto = value?.produto?.trim() || '';
      return feito.length > 0 || produto.length > 0;
    })
  );

  if (Object.keys(mapaLimpo).length === 0) {
    return textoBase;
  }

  const bloco = `[MAPA_FACIAL]\n${JSON.stringify(mapaLimpo, null, 2)}\n[/MAPA_FACIAL]`;
  return textoBase ? `${textoBase}\n\n${bloco}` : bloco;
}

function formatarNomeProcedimento(proc: ProcedimentoPaciente): string {
  const nome = proc.procedimento_tabela_valores_id?.nome_procedimento || 'Procedimento';
  const data = proc.data_procedimento ? new Date(proc.data_procedimento).toLocaleDateString('pt-BR') : 'sem data';
  return `${nome} (${data})`;
}

export default function MapaFacialProcedimento({ procedimentos }: Props) {
  const procedimentosOrdenados = useMemo(() => sortProcedimentosMaisRecentes(procedimentos), [procedimentos]);
  const [procedimentoSelecionadoId, setProcedimentoSelecionadoId] = useState<string>('');
  const [regiaoSelecionada, setRegiaoSelecionada] = useState<RegiaoId>('testa');
  const [mapa, setMapa] = useState<MapaFacialData>({});
  const [saving, setSaving] = useState(false);

  const procedimentoSelecionado = useMemo(
    () => procedimentosOrdenados.find((p) => p.id === procedimentoSelecionadoId) || null,
    [procedimentosOrdenados, procedimentoSelecionadoId]
  );

  useEffect(() => {
    if (procedimentosOrdenados.length > 0 && !procedimentoSelecionadoId) {
      setProcedimentoSelecionadoId(procedimentosOrdenados[0].id);
    }
  }, [procedimentosOrdenados, procedimentoSelecionadoId]);

  useEffect(() => {
    if (!procedimentoSelecionado) {
      setMapa({});
      return;
    }
    setMapa(extractMapaFacial(procedimentoSelecionado.observacoes));
  }, [procedimentoSelecionado]);

  const dadosRegiao = mapa[regiaoSelecionada] || { feito: '', produto: '' };

  function atualizarCampoRegiao(campo: keyof RegiaoData, valor: string) {
    setMapa((prev) => ({
      ...prev,
      [regiaoSelecionada]: {
        feito: campo === 'feito' ? valor : prev[regiaoSelecionada]?.feito || '',
        produto: campo === 'produto' ? valor : prev[regiaoSelecionada]?.produto || '',
      },
    }));
  }

  async function salvarMapa() {
    if (!procedimentoSelecionado) return;
    setSaving(true);

    const observacoesAtualizadas = mergeObservacoes(procedimentoSelecionado.observacoes, mapa);
    const { error } = await supabase
      .from('procedimentos_realizados')
      .update({ observacoes: observacoesAtualizadas || null })
      .eq('id', procedimentoSelecionado.id);

    setSaving(false);

    if (error) {
      toast.error(`Erro ao salvar mapa facial: ${error.message}`);
      return;
    }

    toast.success('Mapa facial salvo no procedimento.');
  }

  const totalRegioesPreenchidas = Object.values(mapa).filter((v) => (v?.feito || '').trim() || (v?.produto || '').trim()).length;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-slate-800">Mapa Facial do Procedimento</h3>
        <p className="text-sm text-slate-500">
          Clique em uma região do rosto e informe o que foi feito e qual produto foi utilizado.
        </p>
      </div>

      {procedimentosOrdenados.length === 0 ? (
        <p className="rounded-xl bg-slate-50 px-3 py-4 text-sm text-slate-500">Sem procedimentos para mapear.</p>
      ) : (
        <>
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-slate-700">Procedimento</label>
            <select
              value={procedimentoSelecionadoId}
              onChange={(e) => setProcedimentoSelecionadoId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-400 focus:outline-none"
            >
              {procedimentosOrdenados.map((proc) => (
                <option key={proc.id} value={proc.id}>
                  {formatarNomeProcedimento(proc)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="relative mx-auto h-[320px] w-[250px]">
                <div className="absolute left-1/2 top-4 h-[285px] w-[180px] -translate-x-1/2 rounded-[48%] border border-slate-300 bg-white shadow-inner" />
                <div className="absolute left-1/2 top-24 h-[88px] w-[2px] -translate-x-1/2 bg-slate-200" />
                <div className="absolute left-1/2 top-[190px] h-[2px] w-[36px] -translate-x-1/2 bg-slate-200" />

                {REGIOES.map((regiao) => {
                  const preenchida = Boolean((mapa[regiao.id]?.feito || '').trim() || (mapa[regiao.id]?.produto || '').trim());
                  const selecionada = regiaoSelecionada === regiao.id;
                  return (
                    <button
                      key={regiao.id}
                      type="button"
                      onClick={() => setRegiaoSelecionada(regiao.id)}
                      className={`absolute ${regiao.positionClass} rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${
                        selecionada
                          ? 'bg-blue-600 text-white shadow'
                          : preenchida
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      }`}
                    >
                      {regiao.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="mb-3 text-sm font-semibold text-slate-700">Região selecionada: {REGIOES.find((r) => r.id === regiaoSelecionada)?.label}</p>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-sm text-slate-600">O que foi feito</label>
                  <input
                    type="text"
                    value={dadosRegiao.feito}
                    onChange={(e) => atualizarCampoRegiao('feito', e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
                    placeholder="Ex: aplicação de toxina botulínica"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-slate-600">Produto utilizado</label>
                  <input
                    type="text"
                    value={dadosRegiao.produto}
                    onChange={(e) => atualizarCampoRegiao('produto', e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
                    placeholder="Ex: Botulift 100U"
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                <span className="text-slate-600">Regiões preenchidas</span>
                <span className="font-semibold text-slate-800">{totalRegioesPreenchidas}</span>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={salvarMapa}
                  disabled={saving || !procedimentoSelecionado}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? 'Salvando...' : 'Salvar mapa facial'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
