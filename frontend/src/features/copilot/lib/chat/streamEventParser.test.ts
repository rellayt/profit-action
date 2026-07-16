import { AnalysisPlanSchema } from '../../../../contracts/generated/schemas';
import { describe, expect, it } from 'vitest';

import { applyDataPart, initialStreamState } from './streamEventParser';

describe('applyDataPart', () => {
  it('stores analysis result from stream payload', () => {
    const next = applyDataPart(initialStreamState, {
      type: 'analysis',
      analysis: {
        analysisId: 'analysis_1',
        operation: 'list',
        periodDays: 30,
        answerText: 'Przeanalizowałem produkty.',
        criteriaSummary: 'Ujemny zysk',
        showChart: true,
        showCta: true,
        plan: AnalysisPlanSchema.parse({}),
        summary: {
          productsAnalyzed: 100,
          matchedProducts: 2,
        },
        kpis: [],
        topProducts: [],
        matchedProductIds: ['p-001', 'p-002'],
        matchedProducts: [],
        groupRows: [],
        aggregations: [],
        chartPoints: [],
        chartCaption: 'Każda kropka to jeden produkt.',
      },
    });

    expect(next.analysis?.analysisId).toBe('analysis_1');
    expect(next.analysis?.summary.matchedProducts).toBe(2);
    expect(next.analysis?.showCta).toBe(true);
    expect(next.unsupported).toBe(false);
  });

  it('marks unsupported stream parts', () => {
    const next = applyDataPart(initialStreamState, {
      type: 'unsupported',
    });
    expect(next.unsupported).toBe(true);
    expect(next.analysis).toBeNull();
  });

  it('captures status messages', () => {
    const next = applyDataPart(initialStreamState, {
      type: 'status',
      message: 'Analizuję dane produktów…',
    });
    expect(next.statusMessage).toBe('Analizuję dane produktów…');
  });

  it('ignores null, non-objects, unknown types, and invalid analysis', () => {
    expect(applyDataPart(initialStreamState, null)).toEqual(initialStreamState);
    expect(applyDataPart(initialStreamState, 'status')).toEqual(initialStreamState);
    expect(applyDataPart(initialStreamState, { type: 'unknown' })).toEqual(initialStreamState);
    expect(
      applyDataPart(initialStreamState, {
        type: 'analysis',
        analysis: { answerText: 'missing id' },
      }),
    ).toEqual(initialStreamState);
  });
});
