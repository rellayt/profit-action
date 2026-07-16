import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '../../../../../test/renderWithProviders';
import type { AnalysisResult } from '../../types/api';
import { AnalysisPlanSchema } from '../../../../contracts/generated/schemas';
import { CopilotResponseActions } from './CopilotResponseActions';

const baseAnalysis: AnalysisResult = {
  analysisId: 'analysis_1',
  operation: 'list',
  periodDays: 30,
  answerText: '',
  criteriaSummary: 'Top 5 zysk',
  showChart: true,
  showCta: true,
  plan: AnalysisPlanSchema.parse({ limit: 5 }),
  summary: { productsAnalyzed: 100, matchedProducts: 5 },
  kpis: [],
  topProducts: [],
  matchedProductIds: ['a', 'b', 'c', 'd', 'e'],
  matchedProducts: [],
  groupRows: [],
  aggregations: [],
  chartPoints: [],
  chartCaption: '',
};

describe('CopilotResponseActions', () => {
  it('labels CTA with limit-aware product count', async () => {
    const user = userEvent.setup();
    const onOpenInsights = vi.fn();

    renderWithProviders(
      <CopilotResponseActions
        analysis={{
          ...baseAnalysis,
          matchedProducts: new Array(100).fill({
            id: 'p',
            name: 'X',
            spend: 1,
            revenue: 1,
            profit: 1,
            stock: 1,
            margin: 1,
            segment: 'neutral',
            matchReason: 'x',
          }),
          summary: { productsAnalyzed: 100, matchedProducts: 100 },
        }}
        onOpenInsights={onOpenInsights}
      />,
    );

    expect(screen.getByRole('button', { name: /5 produktów/i })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Zobacz analizę/i }));
    expect(onOpenInsights).toHaveBeenCalledTimes(1);
  });

  it('hides CTA when there is no analysis result', () => {
    renderWithProviders(
      <CopilotResponseActions
        analysis={{
          ...baseAnalysis,
          showCta: false,
          matchedProductIds: [],
          matchedProducts: [],
          summary: { productsAnalyzed: 100, matchedProducts: 0 },
          plan: AnalysisPlanSchema.parse({}),
        }}
        onOpenInsights={vi.fn()}
      />,
    );
    expect(screen.queryByRole('button', { name: /Zobacz analizę/i })).toBeNull();
  });
});
