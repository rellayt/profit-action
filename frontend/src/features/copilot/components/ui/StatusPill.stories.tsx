import type { Meta, StoryObj } from '@storybook/react';

import { StatusPill } from './StatusPill';

const meta: Meta<typeof StatusPill> = {
  title: 'Profit Action/StatusPill',
  component: StatusPill,
};

export default meta;
type Story = StoryObj<typeof StatusPill>;

export const Live: Story = {
  args: {
    variant: 'live',
    label: 'Live AI',
  },
};

export const Demo: Story = {
  args: {
    variant: 'demo',
    label: 'Demo',
  },
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    label: 'Uwaga',
  },
};

export const Neutral: Story = {
  args: {
    variant: 'neutral',
    label: 'Neutralny',
  },
};
