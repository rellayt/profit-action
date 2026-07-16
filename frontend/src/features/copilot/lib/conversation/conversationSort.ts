import type { ConversationDetail, ConversationSummary } from '../../types/conversation';

export function sortConversationsByUpdatedAt<T extends { updatedAt: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => b.updatedAt - a.updatedAt);
}

export function summaryFromDetail(detail: ConversationDetail): ConversationSummary {
  return {
    id: detail.id,
    title: detail.title,
    createdAt: detail.createdAt,
    updatedAt: detail.updatedAt,
  };
}
