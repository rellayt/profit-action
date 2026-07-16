import { AnalysisPlanSchema } from '../../../../contracts/generated/schemas';
import { describe, expect, it } from 'vitest';

import { repairMessageAnalysisBindings } from './messageAnalysisBindings';

describe('repairMessageAnalysisBindings', () => {
  it('rebinds assistant turns when bindings were lost', () => {
    const next = repairMessageAnalysisBindings(
      [
        { id: 'u1', role: 'user' },
        { id: 'a1', role: 'assistant' },
      ],
      {
        analysis_1: {
          analysisId: 'analysis_1',
          operation: 'list',
          periodDays: 30,
          answerText: '',
          criteriaSummary: 'x',
          showChart: false,
          showCta: true,
          plan: AnalysisPlanSchema.parse({}),
          summary: { productsAnalyzed: 1, matchedProducts: 1 },
          kpis: [],
          topProducts: [],
          matchedProductIds: ['p-1'],
          matchedProducts: [],
          groupRows: [],
          aggregations: [],
          chartPoints: [],
          chartCaption: '',
        },
      },
      {},
    );
    expect(next.a1).toBe('analysis_1');
  });
});
