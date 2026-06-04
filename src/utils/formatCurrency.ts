export function formatCurrency(amount: number | undefined | null): string {
  const safeAmount = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safeAmount);
}

export function formatCurrencyCompact(amount: number | undefined | null): string {
  const safeAmount = Number(amount) || 0;
  if (safeAmount >= 100000) return `₹${(safeAmount / 100000).toFixed(1)}L`;
  if (safeAmount >= 1000) return `₹${(safeAmount / 1000).toFixed(1)}K`;
  return formatCurrency(safeAmount);
}

export function formatAmount(amount: number | undefined | null): string {
  return `₹${(Number(amount) || 0).toLocaleString('en-IN')}`;
}
