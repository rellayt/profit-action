import type { Meta, StoryObj } from '@storybook/react';

import { SpendVsProfitScatter } from './SpendVsProfitScatter';

const chartPoints = [
  {
    productId: 'p-1',
    name: 'Trail Runner Pro',
    spend: 420,
    revenue: 0,
    profit: -420,
    stock: 45,
    segment: 'stop_spending' as const,
    recommendation: 'Wysokie wydatki reklamowe bez odnotowanego przychodu.',
  },
  {
    productId: 'p-2',
    name: 'City Sneaker',
    spend: 180,
    revenue: 920,
    profit: 206,
    stock: 80,
    segment: 'scale' as const,
    recommendation: 'Dodatni zysk z dostępnych zapasów.',
  },
  {
    productId: 'p-3',
    name: 'Neutral Cap',
    spend: 40,
    revenue: 120,
    profit: 20,
    stock: 12,
    segment: 'neutral' as const,
    recommendation: 'Brak skupionego działania w tym oknie.',
  },
  {
    productId: 'p-4',
    name: 'Rescue Softshell',
    spend: 310,
    revenue: 260,
    profit: -40,
    stock: 22,
    segment: 'rescue' as const,
    recommendation: 'Potencjał przy korekcie wydatków.',
  },
];

const meta: Meta<typeof SpendVsProfitScatter> = {
  title: 'Profit Action/SpendVsProfitScatter',
  component: SpendVsProfitScatter,
};

export default meta;
type Story = StoryObj<typeof SpendVsProfitScatter>;

export const Default: Story = {
  args: {
    chartPoints,
    matchedProductIds: ['p-1', 'p-2', 'p-3', 'p-4'],
  },
};

export const WithSelection: Story = {
  args: {
    chartPoints,
    matchedProductIds: ['p-1', 'p-2', 'p-3', 'p-4'],
    selectedId: 'p-2',
  },
};

export const UnmatchedDimmed: Story = {
  args: {
    chartPoints,
    matchedProductIds: ['p-1'],
  },
};
