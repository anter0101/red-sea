export function formatMoney(value: number | null | undefined): string {
  const amount = Number(value ?? 0);
  return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
