import type { Message } from '@ai-sdk/react';
import { useEffect, useRef, type RefObject } from 'react';
import type { PendingChatApply } from '../../lib/chat/pendingChatApply';
import { isChatBusy, type ChatStatus } from '../../lib/chat/chatStatus';
import { DEFAULT_CONVERSATION_TITLE } from '../../lib/conversation/conversationIds';
import { discardUnavailableBackendError } from '../../lib/conversation/discardUnavailableBackendError';
import { repairMessageAnalysisBindings } from '../../lib/conversation/messageAnalysisBindings';
import type { AnalysisResult } from '../../types/api';
import type { ConversationDetail } from '../../types/conversation';

interface UseConversationPersistenceOptions {
  activeConversationIdRef: RefObject<string | null>;
  isHydratingRef: RefObject<boolean>;
  pendingChatApplyRef: RefObject<PendingChatApply | null>;
  getStoredDetail: (conversationId: string) => ConversationDetail | undefined;
  commitLocalDetail: (detail: ConversationDetail) => void;
  upsertConversation: (detail: ConversationDetail) => Promise<unknown>;
  messages: Message[];
  analysesById: Record<string, AnalysisResult>;
  messageAnalysisIds: Record<string, string>;
  status: ChatStatus;
}

export function useConversationPersistence({
  activeConversationIdRef,
  isHydratingRef,
  pendingChatApplyRef,
  getStoredDetail,
  commitLocalDetail,
  upsertConversation,
  messages,
  analysesById,
  messageAnalysisIds,
  status,
}: UseConversationPersistenceOptions) {
  const persistTimerRef = useRef<number | null>(null);
  const touchUpdatedAtRef = useRef(false);

  const latestRef = useRef({
    activeConversationIdRef,
    commitLocalDetail,
    getStoredDetail,
    isHydratingRef,
    pendingChatApplyRef,
    upsertConversation,
  });
  latestRef.current = {
    activeConversationIdRef,
    commitLocalDetail,
    getStoredDetail,
    isHydratingRef,
    pendingChatApplyRef,
    upsertConversation,
  };

  useEffect(() => {
    const {
      activeConversationIdRef: activeIdRef,
      commitLocalDetail: commit,
      getStoredDetail: getStored,
      isHydratingRef: hydratingRef,
      pendingChatApplyRef: pendingRef,
      upsertConversation: upsert,
    } = latestRef.current;

    const id = activeIdRef.current;
    if (!id || hydratingRef.current || pendingRef.current) {
      return;
    }
    if (isChatBusy(status)) {
      return;
    }

    const previous = getStored(id);
    const now = Date.now();
    const touchUpdatedAt = touchUpdatedAtRef.current;
    touchUpdatedAtRef.current = false;

    const nextAnalysesById =
      Object.keys(analysesById).length > 0
        ? analysesById
        : (previous?.analysesById ?? analysesById);
    const nextMessageAnalysisIds =
      Object.keys(messageAnalysisIds).length > 0
        ? messageAnalysisIds
        : repairMessageAnalysisBindings(
            messages,
            nextAnalysesById,
            previous?.messageAnalysisIds ?? messageAnalysisIds,
          );

    const detail: ConversationDetail = {
      id,
      title: previous?.title ?? DEFAULT_CONVERSATION_TITLE,
      createdAt: previous?.createdAt ?? now,
      updatedAt: touchUpdatedAt ? now : (previous?.updatedAt ?? now),
      messages,
      analysesById: nextAnalysesById,
      messageAnalysisIds: nextMessageAnalysisIds,
    };
    commit(detail);

    if (persistTimerRef.current) {
      window.clearTimeout(persistTimerRef.current);
    }
    persistTimerRef.current = window.setTimeout(() => {
      void upsert(detail).catch(discardUnavailableBackendError);
    }, 400);
  }, [analysesById, messageAnalysisIds, messages, status]);

  return {
    touchUpdatedAtRef,
  };
}
