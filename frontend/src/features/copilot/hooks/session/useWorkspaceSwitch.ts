import { useCallback, useEffect, useRef, type RefObject } from 'react';

import type { PendingChatApply } from '../../lib/chat/pendingChatApply';
import { hydrateConversationDetail } from '../../lib/conversation/conversationMerge';
import type { ConversationDetail } from '../../types/conversation';

interface UseWorkspaceSwitchOptions {
  draftResetNonce: number;
  abortActiveStream: () => void;
  switchToConversation: (detail: ConversationDetail) => void;
  switchToDraft: () => void;
  clearComposerState: () => void;
  setActiveConversationId: (conversationId: string | null) => void;
  applyPendingRef: RefObject<(pending: PendingChatApply) => void>;
  onApplyPending: (pending: PendingChatApply) => void;
}

export function useWorkspaceSwitch({
  draftResetNonce,
  abortActiveStream,
  switchToConversation,
  switchToDraft,
  clearComposerState,
  setActiveConversationId,
  applyPendingRef,
  onApplyPending,
}: UseWorkspaceSwitchOptions) {
  const applyDetail = useCallback(
    (detail: ConversationDetail) => {
      abortActiveStream();
      const hydrated = hydrateConversationDetail(detail);
      setActiveConversationId(hydrated.id);
      clearComposerState();
      switchToConversation(hydrated);
    },
    [abortActiveStream, clearComposerState, setActiveConversationId, switchToConversation],
  );

  const resetToDraft = useCallback(() => {
    abortActiveStream();
    setActiveConversationId(null);
    clearComposerState();
    switchToDraft();
  }, [abortActiveStream, clearComposerState, setActiveConversationId, switchToDraft]);

  useEffect(() => {
    applyPendingRef.current = onApplyPending;
  }, [applyPendingRef, onApplyPending]);

  const draftResetSeenRef = useRef(draftResetNonce);

  useEffect(() => {
    if (draftResetSeenRef.current === draftResetNonce) {
      return;
    }
    draftResetSeenRef.current = draftResetNonce;
    resetToDraft();
  }, [draftResetNonce, resetToDraft]);

  return { applyDetail, resetToDraft };
}
