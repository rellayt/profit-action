import type { RefObject } from 'react';

import type { ConversationDetail } from '../../types/conversation';
import { DRAFT_CHAT_SESSION_ID } from './copilotConstants';

export type PendingChatApply =
  | { kind: typeof DRAFT_CHAT_SESSION_ID }
  | { kind: 'conversation'; detail: ConversationDetail };

export const DRAFT_PENDING_APPLY = {
  kind: DRAFT_CHAT_SESSION_ID,
} as const satisfies PendingChatApply;

export function isDraftPendingApply(
  pending: PendingChatApply,
): pending is { kind: typeof DRAFT_CHAT_SESSION_ID } {
  return pending.kind === DRAFT_CHAT_SESSION_ID;
}

export function sessionIdForPendingApply(pending: PendingChatApply): string {
  return isDraftPendingApply(pending) ? DRAFT_CHAT_SESSION_ID : pending.detail.id;
}

export function queueChatSessionApply(
  currentSessionId: string,
  pending: PendingChatApply,
  pendingRef: RefObject<PendingChatApply | null>,
  setSessionId: (sessionId: string) => void,
): PendingChatApply | null {
  const targetSessionId = sessionIdForPendingApply(pending);
  if (currentSessionId === targetSessionId) {
    pendingRef.current = null;
    return pending;
  }
  pendingRef.current = pending;
  setSessionId(targetSessionId);
  return null;
}
