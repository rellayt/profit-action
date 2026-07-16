import type { Message } from '@ai-sdk/react';

import { ChatStatus } from './chatStatus';
import { MessageRole } from './messageRole';

export function findLastUserIndex(messages: Message[]): number {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    if (messages[index]?.role === MessageRole.User) {
      return index;
    }
  }
  return -1;
}

export function findLastAssistantIndex(messages: Message[]): number {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    if (messages[index]?.role === MessageRole.Assistant) {
      return index;
    }
  }
  return -1;
}

export function isTurnAssistant(index: number, messages: Message[]): boolean {
  const message = messages[index];
  if (!message || message.role !== MessageRole.Assistant) {
    return false;
  }
  return index > findLastUserIndex(messages);
}

export function isFailedUserTurn(index: number, messages: Message[], status: ChatStatus): boolean {
  if (status !== ChatStatus.Error) {
    return false;
  }
  return index === findLastUserIndex(messages) && messages[index]?.role === MessageRole.User;
}

export function shouldShowTypingIndicator(messages: Message[], isBusy: boolean): boolean {
  if (!isBusy) {
    return false;
  }
  const lastUserIndex = findLastUserIndex(messages);
  const lastAssistantIndex = findLastAssistantIndex(messages);
  return lastAssistantIndex <= lastUserIndex;
}
