export function formatCurrency(cents: number, currency: string = 'USD'): string {
  const amount = cents / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

export function centsToFloat(cents: number): number {
  return cents / 100;
}

export function floatToCents(amount: number): number {
  return Math.round(amount * 100);
}
