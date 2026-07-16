import type { Meta, StoryObj } from '@storybook/react';
import { TrendingDown } from 'lucide-react';

import { MetricTile } from './MetricTile';

const meta: Meta<typeof MetricTile> = {
  title: 'Profit Action/MetricTile',
  component: MetricTile,
};

export default meta;
type Story = StoryObj<typeof MetricTile>;

export const Default: Story = {
  args: {
    icon: TrendingDown,
    label: 'Wydatki bez przychodu',
    value: '12 450 PLN',
    accent: true,
  },
};
