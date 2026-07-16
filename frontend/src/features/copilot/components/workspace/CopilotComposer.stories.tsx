import type { Meta, StoryObj } from '@storybook/react';

import { CopilotComposer } from './CopilotComposer';

const meta: Meta<typeof CopilotComposer> = {
  title: 'Workspace/CopilotComposer',
  component: CopilotComposer,
  args: {
    value: '',
    onChange: () => undefined,
    onSend: () => undefined,
    isSending: false,
    voiceEnabled: true,
  },
};

export default meta;
type Story = StoryObj<typeof CopilotComposer>;

export const Idle: Story = {};

export const WithDraft: Story = {
  args: {
    value: 'Które produkty mają ujemny zysk?',
  },
};

export const Sending: Story = {
  args: {
    value: 'Analizuję…',
    isSending: true,
  },
};

export const VoiceDisabled: Story = {
  args: {
    voiceEnabled: false,
    voiceDisabledReason: 'Wyłączone w ustawieniach',
  },
};
