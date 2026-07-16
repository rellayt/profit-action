const plnFormatter = new Intl.NumberFormat('pl-PL', {
  style: 'currency',
  currency: 'PLN',
  maximumFractionDigits: 0,
});

const percentFormatter = new Intl.NumberFormat('pl-PL', {
  style: 'percent',
  maximumFractionDigits: 1,
});

export function formatPln(value: number): string {
  return plnFormatter.format(value);
}

export function formatPercent(value: number): string {
  return percentFormatter.format(value / 100);
}

export function formatRelativeFreshness(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 60) {
    return `${Math.max(1, minutes)} min temu`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} godz. temu`;
  }
  return new Intl.DateTimeFormat('pl-PL', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

export function formatProductCount(count: number): string {
  const n = Math.abs(count) % 100;
  const last = n % 10;
  if (n === 1) {
    return `${count} produkt`;
  }
  if (last >= 2 && last <= 4 && (n < 12 || n > 14)) {
    return `${count} produkty`;
  }
  return `${count} produktów`;
}
