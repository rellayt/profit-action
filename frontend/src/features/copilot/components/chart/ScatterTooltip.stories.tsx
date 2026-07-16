import type { Meta, StoryObj } from '@storybook/react';

import { ScatterTooltip } from './ScatterTooltip';

const meta: Meta<typeof ScatterTooltip> = {
  title: 'Profit Action/ScatterTooltip',
  component: ScatterTooltip,
};

export default meta;
type Story = StoryObj<typeof ScatterTooltip>;

export const Active: Story = {
  args: {
    active: true,
    payload: [
      {
        payload: {
          id: 'p-1',
          name: 'Trail Runner Pro',
          spend: 420,
          revenue: 0,
          profit: -420,
          stock: 45,
          segment: 'stop_spending',
        },
      },
    ],
  },
};

export const Inactive: Story = {
  args: {
    active: false,
    payload: [],
  },
};
