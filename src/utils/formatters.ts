/**
 * Utilitários de Formatação e Geração de IDs (formatters.ts)
 *
 * Fornece normalização de dados numéricos decimais (vírgula e ponto)
 * e gerador de chaves primárias seguras contra colisões simultâneas.
 */

/**
 * Normaliza entradas numéricas aceitando tanto vírgula quanto ponto decimal (padrão pt-BR e internacional).
 */
export function parseDecimalInput(value: string, fallback: number = 0): number {
  if (!value || typeof value !== 'string') return fallback;
  const normalized = value.trim().replace(',', '.');
  const parsed = parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : fallback;
}

/**
 * Gera um identificador único combinando prefixo, timestamp e sufixo aleatório
 * para evitar colisões de chave primária em inserções simultâneas.
 */
export function generateId(prefix: string): string {
  const randomPart = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${Date.now()}-${randomPart}`;
}
