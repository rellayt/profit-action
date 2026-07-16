import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '../../../../test/renderWithProviders';
import { SidebarHistory } from './SidebarHistory';

describe('SidebarHistory', () => {
  const conversations = [
    { id: 'c1', title: 'Ujemny zysk', createdAt: 1, updatedAt: 2 },
    { id: 'c2', title: 'Marża', createdAt: 1, updatedAt: 3 },
  ];

  it('selects a conversation', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    renderWithProviders(
      <SidebarHistory
        conversations={conversations}
        activeConversationId={null}
        onSelect={onSelect}
        onDelete={vi.fn()}
      />,
    );
    await user.click(screen.getByText('Marża'));
    expect(onSelect).toHaveBeenCalledWith('c2');
  });

  it('deletes via context menu', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    renderWithProviders(
      <SidebarHistory
        conversations={conversations}
        activeConversationId="c1"
        onSelect={vi.fn()}
        onDelete={onDelete}
      />,
    );

    await user.pointer({
      keys: '[MouseRight>]',
      target: screen.getByText('Ujemny zysk'),
    });
    await user.click(await screen.findByRole('menuitem', { name: /usuń/i }));
    expect(onDelete).toHaveBeenCalledWith('c1');
  });
});
