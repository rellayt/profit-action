import type { ProductSegment } from '../types/api';

export const SEGMENT_LABEL: Record<ProductSegment, string> = {
  stop_spending: 'Wstrzymaj wydatki',
  rescue: 'Ratunek',
  scale: 'Skaluj',
  neutral: 'Pozostałe produkty',
};

export const SEGMENT_COLOR: Record<ProductSegment, string> = {
  stop_spending: 'red',
  rescue: 'yellow',
  scale: 'paGreen',
  neutral: 'gray',
};
