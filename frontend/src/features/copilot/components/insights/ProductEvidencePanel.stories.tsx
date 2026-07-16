import type { Meta, StoryObj } from '@storybook/react';

import type { ClassifiedProduct } from '../../types/api';
import { ProductEvidencePanel } from './ProductEvidencePanel';

const productFixture = {
  id: 'p-2',
  sku: 'SKU-002',
  name: 'Aurora Desk Lamp',
  brand: 'NordPeak',
  category: 'Home',
  googleAdsSpend: 420,
  netRevenue: 0,
  marginPercent: 38,
  addToCartRate: 3.2,
  conversionRate: 0.4,
  impressions: 1200,
  stock: 45,
  profit: -420,
  freshness: [
    {
      source: 'google_ads',
      label: 'Google Ads',
      updatedAt: new Date().toISOString(),
    },
  ],
  segment: 'stop_spending',
  recommendation: 'Wysokie wydatki reklamowe bez odnotowanego przychodu.',
  evidence: ['Wydatki Google Ads: 420 PLN'],
} as ClassifiedProduct;

const meta: Meta<typeof ProductEvidencePanel> = {
  title: 'Profit Action/Insights/ProductEvidencePanel',
  component: ProductEvidencePanel,
};

export default meta;
type Story = StoryObj<typeof ProductEvidencePanel>;

export const WithProduct: Story = {
  args: {
    product: productFixture,
  },
};

export const Empty: Story = {
  args: {
    product: null,
  },
};
