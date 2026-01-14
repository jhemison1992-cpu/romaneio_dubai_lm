/**
 * Converte string de data do input (YYYY-MM-DD) para Date sem problemas de timezone
 * @param dateString - String no formato YYYY-MM-DD
 * @returns Date object com a data correta (meio-dia local para evitar mudança de dia)
 */
export function parseInputDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  // Cria Date ao meio-dia local para evitar problemas de timezone
  return new Date(year, month - 1, day, 12, 0, 0);
}

/**
 * Formata Date para string no formato YYYY-MM-DD para input type="date"
 * @param date - Date object
 * @returns String no formato YYYY-MM-DD
 */
export function formatInputDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formata Date para exibição no formato brasileiro (DD/MM/YYYY)
 * @param date - Date object ou string
 * @returns String no formato DD/MM/YYYY
 */
export function formatBrazilianDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}
