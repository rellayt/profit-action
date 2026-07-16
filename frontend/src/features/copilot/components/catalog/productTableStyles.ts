import type { CSSProperties } from 'react';

interface ProductRowStyleOptions {
  clickable?: boolean;
}

export function getProductRowStyle(
  selectedId: string | null | undefined,
  rowId: string,
  options: ProductRowStyleOptions = {},
): CSSProperties {
  const selected = selectedId === rowId;
  return {
    cursor: options.clickable ? 'pointer' : undefined,
    background: selected ? 'rgb(var(--pa-green-primary) / 0.08)' : undefined,
    borderLeft: selected ? '3px solid rgb(var(--pa-green-primary))' : '3px solid transparent',
  };
}
