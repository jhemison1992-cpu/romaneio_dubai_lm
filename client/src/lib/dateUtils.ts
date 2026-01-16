/**
 * Converte string de data do input (YYYY-MM-DD) para Date sem problemas de timezone
 * @param dateString - String no formato YYYY-MM-DD
 * @returns Date object com a data correta em UTC
 */
export function parseInputDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  // Cria Date em UTC para evitar problemas de timezone
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
}

/**
 * Formata Date para string no formato YYYY-MM-DD para input type="date"
 * @param date - Date object
 * @returns String no formato YYYY-MM-DD
 */
export function formatInputDate(date: Date): string {
  // Usa getUTC* para garantir que está usando UTC
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formata Date para exibição no formato brasileiro (DD/MM/YYYY)
 * @param date - Date object ou string
 * @returns String no formato DD/MM/YYYY
 */
export function formatBrazilianDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const day = String(d.getUTCDate()).padStart(2, '0');
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const year = d.getUTCFullYear();
  return `${day}/${month}/${year}`;
}
