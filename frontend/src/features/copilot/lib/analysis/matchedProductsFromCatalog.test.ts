import { describe, expect, it } from 'vitest';

import type { ClassifiedProduct, MatchedProductRow } from '../../types/api';
import { CATALOG_MATCH_REASON } from './matchReasons';
import { matchedProductsFromCatalog } from './matchedProductsFromCatalog';

const product = {
  id: 'p-1',
  name: 'Alpha',
  googleAdsSpend: 10,
  netRevenue: 20,
  profit: 5,
  stock: 3,
  marginPercent: 25,
  segment: 'scale',
} as ClassifiedProduct;

describe('matchedProductsFromCatalog', () => {
  it('prefers existing rows when present', () => {
    const existing = [
      {
        id: 'p-1',
        name: 'Existing',
        spend: 1,
        revenue: 2,
        profit: 3,
        stock: 4,
        margin: 5,
        segment: 'neutral',
        matchReason: 'from analysis',
      },
    ] as MatchedProductRow[];
    const rows = matchedProductsFromCatalog(['p-1'], new Map([['p-1', product]]), existing);
    expect(rows).toBe(existing);
  });

  it('builds rows from catalog when existing is empty', () => {
    const rows = matchedProductsFromCatalog(['p-1', 'missing'], new Map([['p-1', product]]), []);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      id: 'p-1',
      name: 'Alpha',
      spend: 10,
      revenue: 20,
      profit: 5,
      stock: 3,
      margin: 25,
      segment: 'scale',
      matchReason: CATALOG_MATCH_REASON,
    });
  });
});
