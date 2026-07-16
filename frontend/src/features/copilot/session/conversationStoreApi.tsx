import { createContext, useContext } from 'react';

import type { ConversationStoreApi } from './types';

export const ConversationStoreApiContext = createContext<ConversationStoreApi | null>(null);

export function useConversationStoreApi(): ConversationStoreApi {
  const context = useContext(ConversationStoreApiContext);
  if (!context) {
    throw new Error('useConversationStoreApi must be used within ConversationNavProvider');
  }
  return context;
}
