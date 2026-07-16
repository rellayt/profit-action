import type { ClassifiedProduct } from '../../../src/features/copilot/types/api';

export const sampleProduct = {
  id: 'p-001',
  sku: 'SKU-001',
  name: 'Kamera Pro 8',
  brand: 'Nexir',
  category: 'Elektronika',
  googleAdsSpend: 1150,
  netRevenue: 0,
  profit: -1150,
  stock: 58,
  marginPercent: 28,
  addToCartRate: 2.4,
  conversionRate: 0.3,
  impressions: 18400,
  freshness: [
    {
      source: 'google_ads',
      label: 'Google Ads',
      updatedAt: '2026-07-15T10:00:00.000Z',
    },
    {
      source: 'ga4',
      label: 'GA4',
      updatedAt: '2026-07-15T09:30:00.000Z',
    },
    {
      source: 'inventory',
      label: 'Magazyn',
      updatedAt: '2026-07-15T08:00:00.000Z',
    },
  ],
  segment: 'stop_spending',
  recommendation: 'Zatrzymaj wydatki',
  evidence: [
    'Wydatki Google Ads: 1150 PLN przy zerowym przychodzie',
    'Konwersja 0.3% przy marży 28%',
  ],
} satisfies ClassifiedProduct;
