import type { Message } from '@ai-sdk/react';

import {
  ConversationDetailWireSchema,
  ConversationSummarySchema,
  type ConversationDetailWire,
} from '../../../contracts/generated/schemas';
import type { ConversationDetail, ConversationSummary } from '../types/conversation';
import { fetchJson } from './http';
import { API_DELETE_CONVERSATION_FAILED } from './errorCopy';
import { z } from 'zod';

const ConversationSummaryListSchema = z.array(ConversationSummarySchema);

function wireToDetail(wire: ConversationDetailWire): ConversationDetail {
  return {
    id: wire.id,
    title: wire.title,
    createdAt: wire.createdAt,
    updatedAt: wire.updatedAt,
    messages: wire.messages as Message[],
    analysesById: wire.analysesById,
    messageAnalysisIds: wire.messageAnalysisIds,
  };
}

export async function fetchConversationList(): Promise<ConversationSummary[]> {
  return fetchJson('/api/conversations', ConversationSummaryListSchema);
}

export async function fetchConversationDetail(conversationId: string): Promise<ConversationDetail> {
  const wire = await fetchJson(
    `/api/conversations/${conversationId}`,
    ConversationDetailWireSchema,
  );
  return wireToDetail(wire);
}

export async function upsertConversationDetail(
  detail: ConversationDetail,
): Promise<ConversationDetail> {
  const wire = await fetchJson(`/api/conversations/${detail.id}`, ConversationDetailWireSchema, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: detail.id,
      title: detail.title,
      createdAt: detail.createdAt,
      updatedAt: detail.updatedAt,
      messages: detail.messages.map((message) => ({
        id: message.id,
        role: message.role,
        content:
          typeof message.content === 'string' ? message.content : JSON.stringify(message.content),
      })),
      analysesById: detail.analysesById,
      messageAnalysisIds: detail.messageAnalysisIds,
    }),
  });
  return wireToDetail(wire);
}

export async function deleteConversation(conversationId: string): Promise<void> {
  const response = await fetch(`/api/conversations/${conversationId}`, {
    method: 'DELETE',
  });
  if (!response.ok && response.status !== 404) {
    throw new Error(API_DELETE_CONVERSATION_FAILED);
  }
}
