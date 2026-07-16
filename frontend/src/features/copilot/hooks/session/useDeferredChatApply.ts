import { useCallback, useEffect, useRef, useState } from 'react';

import { DRAFT_CHAT_SESSION_ID } from '../../lib/chat/copilotConstants';
import {
  queueChatSessionApply,
  sessionIdForPendingApply,
  DRAFT_PENDING_APPLY,
  type PendingChatApply,
} from '../../lib/chat/pendingChatApply';
import type { ConversationDetail } from '../../types/conversation';

export function initialChatSessionId(routeConversationId: string | null): string {
  return routeConversationId ?? DRAFT_CHAT_SESSION_ID;
}

export function useDeferredChatApply(
  initialSessionId: string,
  onApply: (pending: PendingChatApply) => void,
) {
  const [chatSessionId, setChatSessionId] = useState(initialSessionId);
  const pendingApplyRef = useRef<PendingChatApply | null>(null);
  const onApplyRef = useRef(onApply);

  useEffect(() => {
    onApplyRef.current = onApply;
  }, [onApply]);

  const switchToDraft = useCallback(() => {
    const ready = queueChatSessionApply(
      chatSessionId,
      DRAFT_PENDING_APPLY,
      pendingApplyRef,
      setChatSessionId,
    );
    if (ready) {
      onApplyRef.current(ready);
    }
  }, [chatSessionId]);

  const switchToConversation = useCallback(
    (detail: ConversationDetail) => {
      const ready = queueChatSessionApply(
        chatSessionId,
        { kind: 'conversation', detail },
        pendingApplyRef,
        setChatSessionId,
      );
      if (ready) {
        onApplyRef.current(ready);
      }
    },
    [chatSessionId],
  );

  useEffect(() => {
    const pending = pendingApplyRef.current;
    if (!pending || chatSessionId !== sessionIdForPendingApply(pending)) {
      return;
    }
    pendingApplyRef.current = null;
    onApplyRef.current(pending);
  }, [chatSessionId]);

  return {
    chatSessionId,
    pendingApplyRef,
    switchToDraft,
    switchToConversation,
  };
}
