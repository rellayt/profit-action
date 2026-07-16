import { waitFor } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Providers, createTestQueryClient } from '../../../../test/renderWithProviders';
import { fetchConversationDetail } from './conversations';
import { useConversationsQuery, useDeleteConversationMutation } from './useConversations';

describe('conversation TanStack Query hooks', () => {
  it('loads conversation list from MSW', async () => {
    const queryClient = createTestQueryClient();
    const { result } = renderHook(() => useConversationsQuery(), {
      wrapper: ({ children }) => <Providers queryClient={queryClient}>{children}</Providers>,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.[0]?.id).toBe('c_demo1');
  });

  it('loads conversation detail through the API client', async () => {
    const detail = await fetchConversationDetail('c_demo1');
    expect(detail.messages).toHaveLength(2);
  });

  it('deletes conversation through mutation and updates list cache', async () => {
    const queryClient = createTestQueryClient();
    const { result } = renderHook(
      () => ({
        list: useConversationsQuery(),
        remove: useDeleteConversationMutation(),
      }),
      {
        wrapper: ({ children }) => <Providers queryClient={queryClient}>{children}</Providers>,
      },
    );

    await waitFor(() => expect(result.current.list.isSuccess).toBe(true));
    expect(result.current.list.data).toHaveLength(1);

    result.current.remove.mutate('c_demo1');
    await waitFor(() => expect(result.current.remove.isSuccess).toBe(true));
    await waitFor(() => expect(result.current.list.data).toEqual([]));
  });
});
