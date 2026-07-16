import { describe, expect, it } from 'vitest';

import { analysisListCount } from './analysisListCount';

describe('analysisListCount', () => {
  it('respects plan.limit for CTA-facing counts', () => {
    expect(
      analysisListCount({
        operation: 'list',
        matchedProducts: new Array(100).fill({ id: 'x' }) as never,
        matchedProductIds: new Array(100).fill('x'),
        summary: { matchedProducts: 100, productsAnalyzed: 100 },
        plan: { limit: 5 },
      }),
    ).toBe(5);
  });

  it('falls back to row count when limit is absent', () => {
    expect(
      analysisListCount({
        operation: 'list',
        matchedProducts: [{}, {}, {}] as never,
        matchedProductIds: [],
        summary: { matchedProducts: 3, productsAnalyzed: 3 },
        plan: {},
      }),
    ).toBe(3);
  });
});
