import { describe, expect, it } from 'vitest';

import type { ClassifiedProduct } from '../../types/api';
import { filterAndSortCatalogProducts } from './catalogProductFilters';

const sample = [
  {
    id: 'p-2',
    sku: 'B',
    name: 'Beta',
    googleAdsSpend: 100,
    netRevenue: 50,
    profit: -10,
    marginPercent: 20,
    stock: 5,
  },
  {
    id: 'p-1',
    sku: 'A',
    name: 'Alpha',
    googleAdsSpend: 200,
    netRevenue: 80,
    profit: 20,
    marginPercent: 30,
    stock: 10,
  },
] as ClassifiedProduct[];

describe('filterAndSortCatalogProducts', () => {
  it('filters by name sku or id', () => {
    const rows = filterAndSortCatalogProducts(sample, 'alp', 'spend', 'desc');
    expect(rows.map((row) => row.id)).toEqual(['p-1']);
  });

  it('sorts numeric fields', () => {
    const rows = filterAndSortCatalogProducts(sample, '', 'spend', 'asc');
    expect(rows.map((row) => row.id)).toEqual(['p-2', 'p-1']);
  });
});
