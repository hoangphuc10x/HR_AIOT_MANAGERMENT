export function formatDateVN(date: Date): string {
  const vnOffset = 7 * 60; // VN = UTC+7
  const local = new Date(date.getTime() + vnOffset * 60 * 1000);

  const year = local.getUTCFullYear();
  const month = String(local.getUTCMonth() + 1).padStart(2, '0');
  const day = String(local.getUTCDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}
