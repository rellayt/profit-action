import type { Meta, StoryObj } from '@storybook/react';

import type { MatchedProductRow } from '../../types/api';
import { MatchedProductsTable } from './MatchedProductsTable';

const sampleRows: MatchedProductRow[] = [
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
    revenue: 180,
    profit: -240,
    stock: 45,
    margin: 38,
    segment: 'rescue',
    matchReason: 'Niska konwersja przy marży powyżej 30%',
  },
  {
    id: 'p-3',
    name: 'Trail Runner Pro',
    spend: 890,
    revenue: 2400,
    profit: 610,
    stock: 120,
    margin: 42,
    segment: 'scale',
    matchReason: 'Dodatni zysk i rosnące impresje',
  },
];

const meta: Meta<typeof MatchedProductsTable> = {
  title: 'Profit Action/Insights/MatchedProductsTable',
  component: MatchedProductsTable,
  args: {
    onSelect: () => undefined,
  },
};

export default meta;
type Story = StoryObj<typeof MatchedProductsTable>;

export const SampleRows: Story = {
  args: {
    products: sampleRows,
  },
};
