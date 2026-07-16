import { createContext, useContext } from 'react';

import type { ChatMessagesValue } from '../types';

export const ChatMessagesContext = createContext<ChatMessagesValue | null>(null);

export function useChatMessages(): ChatMessagesValue {
  const context = useContext(ChatMessagesContext);
  if (!context) {
    throw new Error('useChatMessages must be used within CopilotWorkspaceProvider');
  }
  return context;
}
