import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '../../../../../test/renderWithProviders';
import { CopilotComposer } from './CopilotComposer';

vi.mock('../../hooks/useVoiceCapture', () => ({
  useVoiceCapture: () => ({
    listening: false,
    bars: [],
    setBarCapacity: vi.fn(),
    startListening: vi.fn(),
    cancelListening: vi.fn(),
    confirmListening: vi.fn(),
  }),
}));

describe('CopilotComposer', () => {
  it('sends on Enter without Shift', async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    const onChange = vi.fn();

    renderWithProviders(
      <CopilotComposer
        value="Pytanie"
        onChange={onChange}
        onSend={onSend}
        isSending={false}
        voiceEnabled
      />,
    );

    await user.type(screen.getByRole('textbox', { name: /wiadomość do copilota/i }), '{Enter}');
    expect(onSend).toHaveBeenCalled();
  });

  it('disables send when empty', () => {
    renderWithProviders(
      <CopilotComposer
        value="   "
        onChange={vi.fn()}
        onSend={vi.fn()}
        isSending={false}
        voiceEnabled
      />,
    );
    expect(screen.getByRole('button', { name: /wyślij wiadomość/i })).toBeDisabled();
  });

  it('disables mic when voice is off', () => {
    renderWithProviders(
      <CopilotComposer
        value=""
        onChange={vi.fn()}
        onSend={vi.fn()}
        isSending={false}
        voiceEnabled={false}
      />,
    );
    expect(screen.getByRole('button', { name: /głos/i })).toBeDisabled();
  });
});
