import type { Meta, StoryObj } from '@storybook/react';

import { IntroModalView } from './IntroModalView';

const meta: Meta<typeof IntroModalView> = {
  title: 'Profit Action/Intro/IntroModalView',
  component: IntroModalView,
  args: {
    opened: true,
    onClose: () => undefined,
  },
};

export default meta;

type Story = StoryObj<typeof IntroModalView>;

export const Default: Story = {};

export const Closed: Story = {
  args: {
    opened: false,
  },
};
