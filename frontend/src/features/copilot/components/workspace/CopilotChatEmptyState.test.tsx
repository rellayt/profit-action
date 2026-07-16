import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '../../../../../test/renderWithProviders';
import { CopilotChatEmptyState } from './CopilotChatEmptyState';

describe('CopilotChatEmptyState', () => {
  it('fires chip selection', async () => {
    const user = userEvent.setup();
    const onSelectChip = vi.fn();
    renderWithProviders(<CopilotChatEmptyState onSelectChip={onSelectChip} />);

    const chips = screen.getAllByRole('button');
    expect(chips.length).toBeGreaterThan(0);
    await user.click(chips[0]!);
    expect(onSelectChip).toHaveBeenCalled();
  });

  it('disables chips when disabled', () => {
    renderWithProviders(<CopilotChatEmptyState onSelectChip={vi.fn()} disabled />);
    for (const button of screen.getAllByRole('button')) {
      expect(button).toBeDisabled();
    }
  });
});
