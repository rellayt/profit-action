import type { Meta, StoryObj } from '@storybook/react';

import type { AnalysisResult } from '../../types/api';
import { AnalysisPlanSchema } from '../../../../contracts/generated/schemas';
import { InsightsModalView } from './InsightsModalView';

const sampleAnalysis: AnalysisResult = {
  analysisId: 'analysis_story_1',
  operation: 'list',
  periodDays: 30,
  answerText: 'Znaleziono produkty z wydatkami bez przychodu.',
  criteriaSummary: 'Produkty z ujemnym zyskiem',
  interpretationNote: 'Przykładowa analiza do Storybook.',
  showChart: false,
  showCta: true,
  plan: AnalysisPlanSchema.parse({}),
  summary: {
    productsAnalyzed: 12,
    matchedProducts: 2,
  },
  kpis: [
    {
      key: 'matched',
      label: 'Dopasowane',
      value: 2,
      format: 'number',
    },
    {
      key: 'spend',
      label: 'Wydatki bez przychodu',
      value: 1570,
      format: 'currency',
    },
  ],
  topProducts: [],
  matchedProductIds: ['p-1', 'p-2'],
  matchedProducts: [
    {
      id: 'p-1',
      name: 'Kamera Pro 8',
      spend: 1150,
      revenue: 0,
      profit: -1150,
      stock: 58,
      margin: 28,
      segment: 'stop_spending',
      matchReason: 'Wydatki bez przychodu',
    },
    {
      id: 'p-2',
      name: 'Aurora Desk Lamp',
      spend: 420,
      revenue: 0,
      profit: -420,
      stock: 45,
      margin: 38,
      segment: 'stop_spending',
      matchReason: 'Wydatki bez przychodu',
    },
  ],
  groupRows: [],
  aggregations: [],
  chartPoints: [],
  chartCaption: '',
};

const meta: Meta<typeof InsightsModalView> = {
  title: 'Copilot/Insights/InsightsModalView',
  component: InsightsModalView,
  args: {
    opened: true,
    onClose: () => undefined,
    analysis: sampleAnalysis,
    selectedProduct: null,
    classifiedById: new Map(),
    onSelectScatterProduct: () => undefined,
    onSelectMatchedProduct: () => undefined,
    setSelectedProduct: () => undefined,
  },
};

export default meta;
type Story = StoryObj<typeof InsightsModalView>;

export const WithAnalysis: Story = {};

export const WithSelectedProduct: Story = {
  args: {
    selectedProduct: {
      id: 'p-1',
      sku: 'SKU-1',
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
      freshness: [],
      segment: 'stop_spending',
      recommendation: 'Zatrzymaj wydatki',
      evidence: ['Wydatki bez przychodu'],
    },
    classifiedById: new Map([
      [
        'p-1',
        {
          id: 'p-1',
          sku: 'SKU-1',
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
          freshness: [],
          segment: 'stop_spending',
          recommendation: 'Zatrzymaj wydatki',
          evidence: ['Wydatki bez przychodu'],
        },
      ],
    ]),
  },
};

export const Empty: Story = {
  args: {
    analysis: null,
  },
};
