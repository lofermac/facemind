// utils/statusRules.ts
// Regras canônicas de status e utilitários de datas/normalização

export const DAYS_TO_CONTACT = 30;
export const DAYS_OVERDUE_LIMIT = 180; // 6 meses (~180 dias)
export const CHURN_MONTHS = 6;

export type ProcedureStatus = 'ativo' | 'proximo_vencimento' | 'vencido' | 'sem_duracao' | 'renovado';
export type PatientStatus = 'Ativo' | 'Contato' | 'Vencido' | 'Verificar' | 'Novo' | 'Inativo' | '';

export function normalizeUtcDay(date: Date): Date {
  const d = new Date(date.getTime());
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export function addMonthsUtc(date: Date, months: number): Date {
  const d = new Date(date.getTime());
  d.setUTCMonth(d.getUTCMonth() + months);
  return d;
}

export function diffDaysUtc(a: Date, b: Date): number {
  // floor by UTC day
  const a0 = normalizeUtcDay(a);
  const b0 = normalizeUtcDay(b);
  const ms = a0.getTime() - b0.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

export function calcProcedureStatus(
  dataProcedimento: string | null | undefined,
  duracaoMeses: number | null | undefined,
  today = new Date()
): { status: ProcedureStatus; dias: number | null } {
  if (!dataProcedimento || !duracaoMeses || duracaoMeses <= 0) {
    return { status: 'sem_duracao', dias: null };
  }
  const hoje = normalizeUtcDay(today);
  const realizacao = normalizeUtcDay(new Date(dataProcedimento));
  const vencimento = addMonthsUtc(realizacao, duracaoMeses);
  const diff = Math.floor((vencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return { status: 'vencido', dias: Math.abs(diff) };
  if (diff <= DAYS_TO_CONTACT) return { status: 'proximo_vencimento', dias: diff };
  return { status: 'ativo', dias: diff };
}

// Deriva status exclusivo do paciente usando prioridade de severidade
export function derivePatientStatusFromProcedures(params: {
  procedimentos: Array<{ data_procedimento: string | null | undefined; duracao_efeito_meses: number | null | undefined }>;
  created_at: string;
  paciente_status_banco?: 'Ativo' | 'Inativo' | null;
  today?: Date;
}): PatientStatus {
  const { procedimentos, created_at, paciente_status_banco, today = new Date() } = params;
  if (paciente_status_banco === 'Inativo') return 'Inativo';

  const procs = procedimentos || [];
  if (procs.length === 0) {
    const diffHoras = (new Date().getTime() - new Date(created_at).getTime()) / (1000 * 60 * 60);
    return diffHoras < 24 ? 'Novo' : '';
  }

  let hasVencido = false;
  let hasProximo = false;
  let hasAtivo = false;
  let hasSemDuracao = false;

  for (const p of procs) {
    const { status } = calcProcedureStatus(p.data_procedimento, p.duracao_efeito_meses, today);
    if (status === 'vencido') hasVencido = true;
    else if (status === 'proximo_vencimento') hasProximo = true;
    else if (status === 'ativo') hasAtivo = true;
    else if (status === 'sem_duracao') hasSemDuracao = true;
  }

  if (hasVencido && !hasProximo && !hasAtivo) return 'Vencido';
  if (hasProximo) return 'Contato';
  if (hasAtivo) return 'Ativo';
  if (hasSemDuracao) return 'Verificar';
  return '';
}

export function normalizeText(value: string | null | undefined): string {
  if (!value) return '';
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}+/gu, '')
    .toLowerCase()
    .trim();
}

// Cache leve em memória para durações por nome de procedimento
type DurationMap = Map<string, number>;
let cachedDuration: { map: DurationMap | null; ts: number } = { map: null, ts: 0 };
const TTL_MS = 10 * 60 * 1000; // 10 min

export async function getProcedureDurationMap(fetcher: () => Promise<Array<{ nome_procedimento: string | null; duracao_efeito_meses: number | null }>>): Promise<DurationMap> {
  const now = Date.now();
  if (cachedDuration.map && now - cachedDuration.ts < TTL_MS) return cachedDuration.map;
  const rows = await fetcher();
  const map: DurationMap = new Map();
  rows.forEach(r => {
    const key = normalizeText(r.nome_procedimento || '');
    if (key) map.set(key, (r.duracao_efeito_meses as number) || 0);
  });
  cachedDuration = { map, ts: now };
  return map;
}

export function latestByProcedureName(procs: Array<{ data_procedimento: string | null; procedimento_nome?: string | null }>): Map<string, Date> {
  const m = new Map<string, Date>();
  for (const p of procs) {
    if (!p.data_procedimento || !p.procedimento_nome) continue;
    const key = normalizeText(p.procedimento_nome);
    const dt = normalizeUtcDay(new Date(p.data_procedimento));
    const prev = m.get(key);
    if (!prev || dt.getTime() > prev.getTime()) m.set(key, dt);
  }
  return m;
}

export function hasFutureAppointmentLike(agendamentos: Array<{ data: string | null; rotulo: string | null }>|null|undefined, nomeProcedimento: string): boolean {
  if (!agendamentos || agendamentos.length === 0) return false;
  const today = normalizeUtcDay(new Date());
  const procNorm = normalizeText(nomeProcedimento);
  return agendamentos.some(ag => {
    if (!ag.data || !ag.rotulo) return false;
    const d = normalizeUtcDay(new Date(ag.data));
    if (d.getTime() < today.getTime()) return false;
    const r = normalizeText(ag.rotulo);
    return r.includes(procNorm) || procNorm.includes(r);
  });
}

