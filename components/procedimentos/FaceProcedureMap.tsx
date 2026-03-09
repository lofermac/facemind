'use client';

import React, { useMemo, useState } from 'react';
import { Sparkles, Eraser, ScanFace } from 'lucide-react';

export type FaceRegionId =
  | 'testa'
  | 'glabela'
  | 'temporal_esq'
  | 'temporal_dir'
  | 'olheira_esq'
  | 'olheira_dir'
  | 'malar_esq'
  | 'malar_dir'
  | 'bigode_chines'
  | 'labios'
  | 'mento'
  | 'mandibula';

export interface FaceRegionData {
  feito: string;
  produto: string;
}

export type FaceMapData = Partial<Record<FaceRegionId, FaceRegionData>>;

interface RegionDef {
  id: FaceRegionId;
  label: string;
  helper: string;
  kind: 'ellipse' | 'path';
  cx?: number;
  cy?: number;
  rx?: number;
  ry?: number;
  d?: string;
}

const REGION_DEFS: RegionDef[] = [
  { id: 'testa', label: 'Testa', helper: 'Linhas frontais e refinamento', kind: 'ellipse', cx: 160, cy: 88, rx: 58, ry: 28 },
  { id: 'glabela', label: 'Glabela', helper: 'Região entre sobrancelhas', kind: 'ellipse', cx: 160, cy: 126, rx: 26, ry: 18 },
  { id: 'temporal_esq', label: 'Temporal E.', helper: 'Têmpora esquerda', kind: 'ellipse', cx: 95, cy: 136, rx: 24, ry: 22 },
  { id: 'temporal_dir', label: 'Temporal D.', helper: 'Têmpora direita', kind: 'ellipse', cx: 225, cy: 136, rx: 24, ry: 22 },
  { id: 'olheira_esq', label: 'Olheira E.', helper: 'Suporte periocular esquerdo', kind: 'ellipse', cx: 124, cy: 160, rx: 23, ry: 14 },
  { id: 'olheira_dir', label: 'Olheira D.', helper: 'Suporte periocular direito', kind: 'ellipse', cx: 196, cy: 160, rx: 23, ry: 14 },
  { id: 'malar_esq', label: 'Malar E.', helper: 'Projeção zigomática esquerda', kind: 'ellipse', cx: 112, cy: 196, rx: 30, ry: 20 },
  { id: 'malar_dir', label: 'Malar D.', helper: 'Projeção zigomática direita', kind: 'ellipse', cx: 208, cy: 196, rx: 30, ry: 20 },
  { id: 'bigode_chines', label: 'Sulco NL', helper: 'Sulco nasolabial', kind: 'ellipse', cx: 160, cy: 214, rx: 28, ry: 15 },
  { id: 'labios', label: 'Lábios', helper: 'Volume e contorno labial', kind: 'ellipse', cx: 160, cy: 244, rx: 34, ry: 16 },
  { id: 'mento', label: 'Mento', helper: 'Projeção do queixo', kind: 'ellipse', cx: 160, cy: 278, rx: 24, ry: 16 },
  {
    id: 'mandibula',
    label: 'Mandíbula',
    helper: 'Definição de contorno mandibular',
    kind: 'path',
    d: 'M89,286 C103,317 127,338 160,341 C193,338 217,317 231,286 C217,300 194,311 160,314 C126,311 103,300 89,286 Z',
  },
];

interface FaceProcedureMapProps {
  value: FaceMapData;
  onChange: (next: FaceMapData) => void;
}

function renderRegionShape(region: RegionDef, className: string) {
  if (region.kind === 'ellipse') {
    return <ellipse className={className} cx={region.cx} cy={region.cy} rx={region.rx} ry={region.ry} />;
  }
  return <path className={className} d={region.d} />;
}

export default function FaceProcedureMap({ value, onChange }: FaceProcedureMapProps) {
  const [selectedRegion, setSelectedRegion] = useState<FaceRegionId>('testa');

  const selectedRegionDef = useMemo(
    () => REGION_DEFS.find((r) => r.id === selectedRegion) ?? REGION_DEFS[0],
    [selectedRegion]
  );

  const selectedValue = value[selectedRegion] ?? { feito: '', produto: '' };

  const filledCount = useMemo(
    () =>
      Object.values(value).filter((item) => {
        const feito = item?.feito?.trim() ?? '';
        const produto = item?.produto?.trim() ?? '';
        return feito.length > 0 || produto.length > 0;
      }).length,
    [value]
  );

  function updateRegion(partial: Partial<FaceRegionData>) {
    onChange({
      ...value,
      [selectedRegion]: {
        feito: partial.feito ?? selectedValue.feito ?? '',
        produto: partial.produto ?? selectedValue.produto ?? '',
      },
    });
  }

  function clearRegion() {
    const next = { ...value };
    delete next[selectedRegion];
    onChange(next);
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Mapa Facial 2D</h3>
          <p className="text-sm text-slate-500">Clique em qualquer região do rosto para registrar aplicação e produto.</p>
        </div>
        <div className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-right">
          <p className="text-xs font-medium text-blue-700">Regiões preenchidas</p>
          <p className="text-xl font-bold text-blue-800">{filledCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mx-auto max-w-[320px]">
            <svg viewBox="0 0 320 380" className="w-full">
              <defs>
                <linearGradient id="faceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f8fafc" />
                  <stop offset="100%" stopColor="#e2e8f0" />
                </linearGradient>
              </defs>

              <path
                d="M160,24 C216,24 261,69 261,133 C261,161 250,191 233,218 C224,232 221,245 220,257 C218,291 195,332 160,340 C125,332 102,291 100,257 C99,245 96,232 87,218 C70,191 59,161 59,133 C59,69 104,24 160,24 Z"
                fill="url(#faceGradient)"
                stroke="#cbd5e1"
                strokeWidth="2"
              />
              <path d="M122 142 Q140 132 153 142" stroke="#94a3b8" strokeWidth="2" fill="none" />
              <path d="M167 142 Q180 132 198 142" stroke="#94a3b8" strokeWidth="2" fill="none" />
              <path d="M160 154 L154 220 L166 220" stroke="#94a3b8" strokeWidth="2" fill="none" />
              <path d="M132 262 Q160 278 188 262" stroke="#64748b" strokeWidth="2" fill="none" />

              {REGION_DEFS.map((region) => {
                const regionValue = value[region.id];
                const isFilled = Boolean((regionValue?.feito || '').trim() || (regionValue?.produto || '').trim());
                const isSelected = selectedRegion === region.id;
                const fillClass = isSelected
                  ? 'fill-blue-500/40 stroke-blue-600'
                  : isFilled
                  ? 'fill-emerald-400/35 stroke-emerald-600'
                  : 'fill-slate-300/20 stroke-slate-400';

                return (
                  <g key={region.id} onClick={() => setSelectedRegion(region.id)} className="cursor-pointer">
                    {renderRegionShape(region, `${fillClass} transition-all duration-200 stroke-2 hover:fill-blue-500/30`)}
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {REGION_DEFS.map((region) => {
              const regionValue = value[region.id];
              const isFilled = Boolean((regionValue?.feito || '').trim() || (regionValue?.produto || '').trim());
              const isSelected = selectedRegion === region.id;
              return (
                <button
                  key={`chip-${region.id}`}
                  type="button"
                  onClick={() => setSelectedRegion(region.id)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : isFilled
                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {region.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <ScanFace className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm font-semibold text-slate-900">{selectedRegionDef.label}</p>
              <p className="text-xs text-slate-500">{selectedRegionDef.helper}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">O que foi feito</label>
              <input
                type="text"
                value={selectedValue.feito}
                onChange={(e) => updateRegion({ feito: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
                placeholder="Ex: toxina botulínica, preenchimento..."
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Produto utilizado</label>
              <input
                type="text"
                value={selectedValue.produto}
                onChange={(e) => updateRegion({ produto: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
                placeholder="Ex: Allergan, Rennova..."
              />
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
            <p className="mb-2 text-xs font-semibold text-slate-600">Sugestões rápidas</p>
            <div className="flex flex-wrap gap-2">
              {['Toxina botulínica', 'Preenchimento', 'Skinbooster', 'Bioestimulador'].map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => updateRegion({ feito: sug })}
                  className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700 hover:border-blue-200 hover:bg-blue-50"
                >
                  <Sparkles className="mr-1 inline h-3 w-3" />
                  {sug}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={clearRegion}
              className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
            >
              <Eraser className="h-3.5 w-3.5" />
              Limpar região
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
