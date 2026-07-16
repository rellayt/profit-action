import type { Meta, StoryObj } from '@storybook/react';

import { ProductCatalogTable } from './ProductCatalogTable';

const meta: Meta<typeof ProductCatalogTable> = {
  title: 'Profit Action/ProductCatalogTable',
  component: ProductCatalogTable,
};

export default meta;
type Story = StoryObj<typeof ProductCatalogTable>;

export const Default: Story = {
  args: {
    products: [
      {
        id: 'p-1',
        sku: 'SKU-001',
        name: 'Trail Runner Pro',
        brand: 'NordPeak',
        category: 'Footwear',
        googleAdsSpend: 420,
        netRevenue: 0,
        marginPercent: 38,
        addToCartRate: 3.2,
        conversionRate: 0.4,
        impressions: 1200,
        stock: 45,
        profit: -420,
        freshness: [],
        segment: 'stop_spending',
        recommendation: 'Wysokie wydatki reklamowe bez odnotowanego przychodu.',
        evidence: [],
      },
    ],
  },
};
