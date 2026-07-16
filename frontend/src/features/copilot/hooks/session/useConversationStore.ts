import { useCallback, useEffect, useState } from 'react';

import { useConversationsQuery } from '../../api/useConversations';
import {
  deleteLocalConversation,
  loadConversationStorage,
  saveConversationStorage,
  upsertLocalConversation,
} from '../../lib/conversation/conversationStorage';
import { sortConversationsByUpdatedAt } from '../../lib/conversation/conversationSort';
import type { ConversationDetail, ConversationSummary } from '../../types/conversation';

interface ConversationStoreState {
  conversations: ConversationSummary[];
  detailsById: Record<string, ConversationDetail>;
}

const initialStorage = loadConversationStorage();

export function useConversationStore() {
  const [store, setStore] = useState<ConversationStoreState>(initialStorage);
  const conversationsQuery = useConversationsQuery();

  const commitLocalDetail = useCallback((detail: ConversationDetail) => {
    setStore((current) => {
      const merged = upsertLocalConversation(current, detail);
      saveConversationStorage(merged);
      return merged;
    });
  }, []);

  useEffect(() => {
    const remote = conversationsQuery.data;
    if (!remote?.length) {
      return;
    }
    setStore((current) => {
      const byId = new Map(current.conversations.map((item) => [item.id, item]));
      for (const item of remote) {
        const existing = byId.get(item.id);
        if (!existing || item.updatedAt >= existing.updatedAt) {
          byId.set(item.id, item);
        }
      }
      return {
        ...current,
        conversations: sortConversationsByUpdatedAt([...byId.values()]),
      };
    });
  }, [conversationsQuery.data]);

  const getStoredDetail = useCallback(
    (conversationId: string) => store.detailsById[conversationId],
    [store.detailsById],
  );

  const removeLocalConversation = useCallback((conversationId: string) => {
    setStore((current) => {
      const next = deleteLocalConversation(current, conversationId);
      saveConversationStorage(next);
      return next;
    });
  }, []);

  return {
    conversations: store.conversations,
    commitLocalDetail,
    getStoredDetail,
    removeLocalConversation,
  };
}
