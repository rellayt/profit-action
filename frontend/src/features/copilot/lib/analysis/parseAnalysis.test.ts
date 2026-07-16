import { AnalysisPlanSchema, AnalysisResultSchema } from '../../../../contracts/generated/schemas';
import { describe, expect, it } from 'vitest';

import { parseAnalysis } from './parseAnalysis';

describe('parseAnalysis', () => {
  it('accepts a valid AnalysisResult payload', () => {
    const analysis = parseAnalysis({
      analysisId: 'analysis_1',
      operation: 'list',
      periodDays: 30,
      showCta: true,
      showChart: true,
      summary: { productsAnalyzed: 10, matchedProducts: 2 },
      matchedProductIds: ['p-1', 'p-2'],
      matchedProducts: [
        {
          id: 'p-1',
          name: 'A',
          spend: 1,
          revenue: 0,
          profit: -1,
          stock: 1,
          margin: 10,
          segment: 'stop_spending',
          matchReason: 'ujemny zysk',
        },
      ],
      kpis: [],
      topProducts: [],
      groupRows: [],
      aggregations: [],
      chartPoints: [],
      chartCaption: '',
      answerText: '',
      criteriaSummary: 'profit < 0',
      plan: AnalysisPlanSchema.parse({}),
    });

    expect(analysis?.analysisId).toBe('analysis_1');
    expect(analysis?.showCta).toBe(true);
    expect(analysis?.matchedProductIds).toEqual(['p-1', 'p-2']);
  });

  it('rejects invalid payloads', () => {
    expect(parseAnalysis({ answerText: 'missing id' })).toBeNull();
    expect(AnalysisResultSchema.safeParse({}).success).toBe(false);
  });
});
