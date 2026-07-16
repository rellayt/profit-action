import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  sortConversationsByUpdatedAt,
  summaryFromDetail,
} from '../lib/conversation/conversationSort';
import type { ConversationDetail, ConversationSummary } from '../types/conversation';
import {
  deleteConversation,
  fetchConversationList,
  upsertConversationDetail,
} from './conversations';
import { conversationQueryKeys } from './queryKeys';

export function useConversationsQuery(enabled = true) {
  return useQuery({
    queryKey: conversationQueryKeys.list(),
    queryFn: fetchConversationList,
    staleTime: 60_000,
    enabled,
  });
}

export function useUpsertConversationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (detail: ConversationDetail) => upsertConversationDetail(detail),
    onSuccess: (detail) => {
      queryClient.setQueryData(conversationQueryKeys.detail(detail.id), detail);
      queryClient.setQueryData<ConversationSummary[]>(conversationQueryKeys.list(), (current) => {
        const summary = summaryFromDetail(detail);
        const without = (current ?? []).filter((item) => item.id !== detail.id);
        return sortConversationsByUpdatedAt([summary, ...without]);
      });
    },
  });
}

export function useDeleteConversationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (conversationId: string) => deleteConversation(conversationId),
    onSuccess: (_result, conversationId) => {
      queryClient.removeQueries({
        queryKey: conversationQueryKeys.detail(conversationId),
      });
      queryClient.setQueryData<ConversationSummary[]>(conversationQueryKeys.list(), (current) =>
        (current ?? []).filter((item) => item.id !== conversationId),
      );
    },
  });
}
