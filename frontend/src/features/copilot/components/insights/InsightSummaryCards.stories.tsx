import type { Meta, StoryObj } from '@storybook/react';

import type { AnalysisResult } from '../../types/api';
import { AnalysisPlanSchema } from '../../../../contracts/generated/schemas';
import { InsightSummaryCards } from './InsightSummaryCards';

const analysisFixture = {
  analysisId: 'analysis_story',
  operation: 'list',
  periodDays: 30,
  answerText: '',
  criteriaSummary: 'Produkty z ujemnym zyskiem',
  showChart: true,
  showCta: true,
  plan: AnalysisPlanSchema.parse({}),
  summary: {
    productsAnalyzed: 100,
    matchedProducts: 25,
  },
  kpis: [
    { key: 'matched', label: 'Dopasowane produkty', value: 25, format: 'number' },
    { key: 'spend', label: 'Suma wydatków', value: 18420, format: 'currency' },
    { key: 'profit', label: 'Suma zysku', value: -9320, format: 'currency' },
  ],
  topProducts: [],
  matchedProductIds: [],
  matchedProducts: [],
  groupRows: [],
  aggregations: [],
  chartPoints: [],
  chartCaption: '',
} as AnalysisResult;

const meta: Meta<typeof InsightSummaryCards> = {
  title: 'Copilot/Insights/InsightSummaryCards',
  component: InsightSummaryCards,
};

export default meta;
type Story = StoryObj<typeof InsightSummaryCards>;

export const Default: Story = {
  args: {
    analysis: analysisFixture,
  },
};
