import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '../../../../../test/renderWithProviders';
import { CopilotPageAlerts } from './CopilotPageAlerts';

describe('CopilotPageAlerts', () => {
  it('shows backend unavailable alert', () => {
    renderWithProviders(
      <CopilotPageAlerts backendUnavailable voiceError={null} />,
    );
    expect(screen.getByText(/usługa niedostępna/i)).toBeInTheDocument();
  });

  it('shows voice error and dismisses', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    renderWithProviders(
      <CopilotPageAlerts
        backendUnavailable={false}
        voiceError="Mikrofon niedostępny"
        onDismissVoiceError={onDismiss}
      />,
    );
    expect(screen.getByText(/mikrofon niedostępny/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /spróbuj ponownie/i }));
    expect(onDismiss).toHaveBeenCalled();
  });
});
