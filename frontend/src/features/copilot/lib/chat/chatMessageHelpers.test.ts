import { describe, expect, it } from 'vitest';
import type { Message } from '@ai-sdk/react';

import {
  findLastAssistantIndex,
  findLastUserIndex,
  isFailedUserTurn,
  isTurnAssistant,
  shouldShowTypingIndicator,
} from './chatMessageHelpers';

const messages = [
  { id: '1', role: 'user', content: 'First question' },
  { id: '2', role: 'assistant', content: 'First answer' },
  { id: '3', role: 'user', content: 'Second question' },
] as Message[];

describe('chatMessageHelpers', () => {
  it('finds last user and assistant indices', () => {
    expect(findLastUserIndex(messages)).toBe(2);
    expect(findLastAssistantIndex(messages)).toBe(1);
  });

  it('marks only assistant after last user as turn assistant', () => {
    expect(isTurnAssistant(1, messages)).toBe(false);
    expect(isTurnAssistant(2, messages)).toBe(false);
  });

  it('shows typing when busy and no assistant after last user', () => {
    expect(shouldShowTypingIndicator(messages, true)).toBe(true);
    expect(
      shouldShowTypingIndicator(
        [...messages, { id: '4', role: 'assistant', content: 'Second answer' } as Message],
        true,
      ),
    ).toBe(false);
  });

  it('marks only the last user turn as failed on error status', () => {
    expect(isFailedUserTurn(2, messages, 'error')).toBe(true);
    expect(isFailedUserTurn(0, messages, 'error')).toBe(false);
    expect(isFailedUserTurn(2, messages, 'ready')).toBe(false);
  });
});
