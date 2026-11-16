import { Subject, Task } from '../types';

/**
 * Retorna a data local no formato YYYY-MM-DD (evitando desvios de fuso horário UTC).
 */
export function getTodayISO(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Retorna uma data futura/passada somando `days` à data local atual no formato YYYY-MM-DD.
 */
export function addDaysISO(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Valida se ano, mês e dia formam uma data real no calendário.
 */
function isValidCalendarDate(year: number, month: number, day: number): boolean {
  if (year < 2000 || year > 2100) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;

  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

/**
 * Converte entradas nos formatos DD/MM/AAAA ou AAAA-MM-DD para o formato padronizado do banco (YYYY-MM-DD).
 * Retorna `null` caso a data seja inválida.
 */
export function normalizeDateInput(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Formato ISO: YYYY-MM-DD
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (isoMatch) {
    const year = Number(isoMatch[1]);
    const month = Number(isoMatch[2]);
    const day = Number(isoMatch[3]);
    if (!isValidCalendarDate(year, month, day)) return null;
    return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
  }

  // Formato Brasileiro: DD/MM/YYYY
  const brMatch = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(trimmed);
  if (brMatch) {
    const day = Number(brMatch[1]);
    const month = Number(brMatch[2]);
    const year = Number(brMatch[3]);
    if (!isValidCalendarDate(year, month, day)) return null;
    return `${brMatch[3]}-${brMatch[2]}-${brMatch[1]}`;
  }

  return null;
}

/**
 * Aplica máscara progressiva DD/MM/AAAA caso o usuário digite apenas números,
 * ou mantém o formato AAAA-MM-DD se começar com 4 dígitos seguidos de hífen.
 */
export function formatDateMask(raw: string): string {
  const trimmed = raw.trim();
  if (/^\d{4}-/.test(trimmed)) {
    return trimmed.slice(0, 10);
  }
  const digits = trimmed.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
}

/**
 * Formata uma string YYYY-MM-DD para exibição amigável DD/MM/AAAA.
 */
export function formatDateDisplay(isoDate: string): string {
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate?.trim() ?? '');
  if (isoMatch) {
    return `${isoMatch[3]}/${isoMatch[2]}/${isoMatch[1]}`;
  }
  return isoDate;
}

export type TaskDueState = 'overdue' | 'today' | 'upcoming7Days' | 'later';

/**
 * Classifica o prazo de uma tarefa em relação à data de hoje.
 */
export function getTaskDueState(dueDate: string): TaskDueState {
  const normalized = normalizeDateInput(dueDate) ?? dueDate;
  const today = getTodayISO();
  const limit7Days = addDaysISO(7);

  if (normalized < today) return 'overdue';
  if (normalized === today) return 'today';
  if (normalized <= limit7Days) return 'upcoming7Days';
  return 'later';
}

/**
 * Filtra tarefas não concluídas que estão atrasadas ou vencem nos próximos 7 dias,
 * ordenadas pela data de entrega mais próxima.
 */
export function filterUpcomingAndOverdueTasks(tasks: Task[]): Task[] {
  const limit7Days = addDaysISO(7);

  return tasks
    .filter((t) => {
      if (t.status === 'Concluído') return false;
      const normalized = normalizeDateInput(t.dueDate) ?? t.dueDate;
      return normalized <= limit7Days;
    })
    .sort((a, b) => {
      const dateA = normalizeDateInput(a.dueDate) ?? a.dueDate;
      const dateB = normalizeDateInput(b.dueDate) ?? b.dueDate;
      return dateA.localeCompare(dateB);
    });
}

const WEEKDAY_PATTERNS: { dayIndex: number; label: string; tokens: string[] }[] = [
  { dayIndex: 0, label: 'Domingo', tokens: ['domingo', 'dom'] },
  { dayIndex: 1, label: 'Segunda', tokens: ['segunda', 'segundas', 'seg', '2ª', '2a'] },
  { dayIndex: 2, label: 'Terça', tokens: ['terça', 'terças', 'terca', 'tercas', 'ter', '3ª', '3a'] },
  { dayIndex: 3, label: 'Quarta', tokens: ['quarta', 'quartas', 'qua', '4ª', '4a'] },
  { dayIndex: 4, label: 'Quinta', tokens: ['quinta', 'quintas', 'qui', '5ª', '5a'] },
  { dayIndex: 5, label: 'Sexta', tokens: ['sexta', 'sextas', 'sex', '6ª', '6a'] },
  { dayIndex: 6, label: 'Sábado', tokens: ['sábado', 'sábados', 'sabado', 'sabados', 'sab', 'sáb'] },
];

function scheduleMatchesDay(schedule: string, dayIndex: number): boolean {
  const lower = schedule.toLowerCase();
  if (lower.includes('diariamente') || lower.includes('todos os dias')) {
    return true;
  }
  const entry = WEEKDAY_PATTERNS.find((w) => w.dayIndex === dayIndex);
  if (!entry) return false;
  return entry.tokens.some((token) => {
    const regex = new RegExp(`(^|[^a-záàâãéêíóôõúç])${token}([^a-záàâãéêíóôõúç]|$)`, 'i');
    return regex.test(lower);
  });
}

/**
 * Identifica dinamicamente a próxima aula com base no dia da semana atual.
 */
export function getNextClassForToday(subjects: Subject[]): {
  subject: Subject | null;
  badgeLabel: string;
} {
  if (subjects.length === 0) {
    return { subject: null, badgeLabel: '' };
  }

  const todayIndex = new Date().getDay();

  // 1. Verifica se há alguma disciplina no dia de hoje
  const todayMatch = subjects.find((s) => scheduleMatchesDay(s.schedule || '', todayIndex));
  if (todayMatch) {
    return { subject: todayMatch, badgeLabel: 'Hoje' };
  }

  // 2. Procura o próximo dia da semana nos próximos 6 dias
  for (let offset = 1; offset <= 6; offset++) {
    const targetDay = (todayIndex + offset) % 7;
    const match = subjects.find((s) => scheduleMatchesDay(s.schedule || '', targetDay));
    if (match) {
      const dayMeta = WEEKDAY_PATTERNS.find((w) => w.dayIndex === targetDay);
      const badgeLabel = offset === 1 ? 'Amanhã' : dayMeta?.label ?? 'Próxima';
      return { subject: match, badgeLabel };
    }
  }

  // 3. Fallback caso nenhuma disciplina tenha dia da semana reconhecido no texto
  return { subject: subjects[0], badgeLabel: 'Na Grade' };
}
