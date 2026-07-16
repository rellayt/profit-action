import type { ConversationDetail, ConversationSummary } from '../../types/conversation';
import { PA_STORAGE_KEYS } from '../storage/localStorageKeys';
import { sortConversationsByUpdatedAt, summaryFromDetail } from './conversationSort';

const STORAGE_KEY = PA_STORAGE_KEYS.conversations;
const MAX_CONVERSATIONS = 30;

interface PersistedConversations {
  conversations: ConversationSummary[];
  detailsById: Record<string, ConversationDetail>;
}

const EMPTY: PersistedConversations = {
  conversations: [],
  detailsById: {},
};

export function loadConversationStorage(): PersistedConversations {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return EMPTY;
    }
    const parsed = JSON.parse(raw) as PersistedConversations;
    const conversations = Array.isArray(parsed.conversations)
      ? parsed.conversations
          .filter((item) => item && typeof item.id === 'string')
          .slice(0, MAX_CONVERSATIONS)
      : [];
    const detailsById =
      parsed.detailsById && typeof parsed.detailsById === 'object' ? parsed.detailsById : {};
    return { conversations, detailsById };
  } catch {
    return EMPTY;
  }
}

export function saveConversationStorage(state: PersistedConversations): void {
  try {
    const conversations = sortConversationsByUpdatedAt(state.conversations).slice(
      0,
      MAX_CONVERSATIONS,
    );
    const keep = new Set(conversations.map((item) => item.id));
    const detailsById: Record<string, ConversationDetail> = {};
    for (const id of keep) {
      const detail = state.detailsById[id];
      if (detail) {
        detailsById[id] = detail;
      }
    }
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ conversations, detailsById } satisfies PersistedConversations),
    );
  } catch {
    return;
  }
}

export function upsertLocalConversation(
  state: PersistedConversations,
  detail: ConversationDetail,
): PersistedConversations {
  const summary = summaryFromDetail(detail);
  const existingIndex = state.conversations.findIndex((item) => item.id === detail.id);
  let conversations: ConversationSummary[];

  if (existingIndex === -1) {
    conversations = [summary, ...state.conversations];
  } else {
    const previous = state.conversations[existingIndex];
    const without = state.conversations.filter((item) => item.id !== detail.id);
    if (summary.updatedAt > (previous?.updatedAt ?? 0)) {
      conversations = [summary, ...without];
    } else {
      conversations = [...state.conversations];
      conversations[existingIndex] = summary;
    }
  }

  return {
    conversations: conversations.slice(0, MAX_CONVERSATIONS),
    detailsById: {
      ...state.detailsById,
      [detail.id]: detail,
    },
  };
}

export function deleteLocalConversation(
  state: PersistedConversations,
  conversationId: string,
): PersistedConversations {
  const { [conversationId]: _removed, ...detailsById } = state.detailsById;
  return {
    conversations: state.conversations.filter((item) => item.id !== conversationId),
    detailsById,
  };
}
