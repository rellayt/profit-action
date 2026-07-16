import { describe, expect, it } from 'vitest';

import { upsertLocalConversation } from './conversationStorage';
import type { ConversationDetail } from '../../types/conversation';

describe('conversationStorage', () => {
  it('inserts a new summary at the front of the list', () => {
    const detail: ConversationDetail = {
      id: 'c1',
      title: 'Ujemny zysk',
      createdAt: 1,
      updatedAt: 2,
      messages: [],
      analysesById: {},
      messageAnalysisIds: {},
    };
    const next = upsertLocalConversation(
      {
        conversations: [{ id: 'c0', title: 'Stara', createdAt: 0, updatedAt: 1 }],
        detailsById: {},
      },
      detail,
    );
    expect(next.conversations[0]?.id).toBe('c1');
    expect(next.detailsById.c1?.title).toBe('Ujemny zysk');
  });

  it('keeps position when opening an existing conversation without a newer update', () => {
    const detail: ConversationDetail = {
      id: 'c0',
      title: 'Stara',
      createdAt: 0,
      updatedAt: 1,
      messages: [],
      analysesById: {},
      messageAnalysisIds: {},
    };
    const next = upsertLocalConversation(
      {
        conversations: [
          { id: 'c1', title: 'Nowa', createdAt: 2, updatedAt: 3 },
          { id: 'c0', title: 'Stara', createdAt: 0, updatedAt: 1 },
        ],
        detailsById: {},
      },
      detail,
    );
    expect(next.conversations.map((item) => item.id)).toEqual(['c1', 'c0']);
  });

  it('moves to the front when updatedAt increases', () => {
    const detail: ConversationDetail = {
      id: 'c0',
      title: 'Stara odświeżona',
      createdAt: 0,
      updatedAt: 5,
      messages: [],
      analysesById: {},
      messageAnalysisIds: {},
    };
    const next = upsertLocalConversation(
      {
        conversations: [
          { id: 'c1', title: 'Nowa', createdAt: 2, updatedAt: 3 },
          { id: 'c0', title: 'Stara', createdAt: 0, updatedAt: 1 },
        ],
        detailsById: {},
      },
      detail,
    );
    expect(next.conversations.map((item) => item.id)).toEqual(['c0', 'c1']);
  });
});
