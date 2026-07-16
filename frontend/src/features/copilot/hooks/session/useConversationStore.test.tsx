import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PA_STORAGE_KEYS } from '../../lib/storage/localStorageKeys';
import type { ConversationDetail, ConversationSummary } from '../../types/conversation';
import { useConversationStore } from './useConversationStore';

const remoteOnly: ConversationSummary = {
  id: 'c_remote_only',
  title: 'Tylko z API',
  createdAt: 1,
  updatedAt: 100,
};

const remoteList = [remoteOnly];

vi.mock('../../api/useConversations', () => ({
  useConversationsQuery: () => ({
    data: remoteList,
    isError: false,
  }),
}));

function detail(id: string): ConversationDetail {
  return {
    id,
    title: 'Lokalna',
    createdAt: 1,
    updatedAt: 50,
    messages: [],
    analysesById: {},
    messageAnalysisIds: {},
  };
}

describe('useConversationStore', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('keeps API-only sidebar rows after commitLocalDetail', () => {
    const { result } = renderHook(() => useConversationStore());

    expect(result.current.conversations.some((item) => item.id === 'c_remote_only')).toBe(true);

    act(() => {
      result.current.commitLocalDetail(detail('c_local'));
    });

    expect(result.current.conversations.some((item) => item.id === 'c_remote_only')).toBe(true);
    expect(result.current.conversations.some((item) => item.id === 'c_local')).toBe(true);
    expect(localStorage.getItem(PA_STORAGE_KEYS.conversations)).toContain('c_local');
  });
});
