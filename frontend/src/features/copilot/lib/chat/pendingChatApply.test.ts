import { describe, expect, it, vi } from 'vitest';

import type { ConversationDetail } from '../../types/conversation';
import { DRAFT_CHAT_SESSION_ID } from './copilotConstants';
import {
  DRAFT_PENDING_APPLY,
  isDraftPendingApply,
  queueChatSessionApply,
  sessionIdForPendingApply,
  type PendingChatApply,
} from './pendingChatApply';

function detail(id: string): ConversationDetail {
  return {
    id,
    title: 'Test',
    createdAt: 1,
    updatedAt: 1,
    messages: [],
    analysesById: {},
    messageAnalysisIds: {},
  };
}

describe('pendingChatApply', () => {
  it('maps draft and conversation to session ids', () => {
    expect(sessionIdForPendingApply(DRAFT_PENDING_APPLY)).toBe(DRAFT_CHAT_SESSION_ID);
    expect(
      sessionIdForPendingApply({ kind: 'conversation', detail: detail('c-1') }),
    ).toBe('c-1');
    expect(isDraftPendingApply(DRAFT_PENDING_APPLY)).toBe(true);
  });

  it('applies immediately when the session already matches', () => {
    const pendingRef = { current: null as PendingChatApply | null };
    const setSessionId = vi.fn();

    const ready = queueChatSessionApply(
      DRAFT_CHAT_SESSION_ID,
      DRAFT_PENDING_APPLY,
      pendingRef,
      setSessionId,
    );

    expect(ready).toEqual(DRAFT_PENDING_APPLY);
    expect(pendingRef.current).toBeNull();
    expect(setSessionId).not.toHaveBeenCalled();
  });

  it('defers apply and switches session id when needed', () => {
    const pendingRef = { current: null as PendingChatApply | null };
    const setSessionId = vi.fn();
    const pending: PendingChatApply = {
      kind: 'conversation',
      detail: detail('c-9'),
    };

    const ready = queueChatSessionApply(
      DRAFT_CHAT_SESSION_ID,
      pending,
      pendingRef,
      setSessionId,
    );

    expect(ready).toBeNull();
    expect(pendingRef.current).toEqual(pending);
    expect(setSessionId).toHaveBeenCalledWith('c-9');
  });
});
