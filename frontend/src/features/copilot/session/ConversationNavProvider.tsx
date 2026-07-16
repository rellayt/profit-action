import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useDeleteConversationMutation } from '../api/useConversations';
import { useConversationStore } from '../hooks/session/useConversationStore';
import { discardUnavailableBackendError } from '../lib/conversation/discardUnavailableBackendError';
import { isCopilotDraftRoute, matchCopilotConversationId } from './copilotRoutes';
import {
  ConversationStoreApiContext,
} from './conversationStoreApi';
import type { ConversationNavValue, ConversationStoreApi } from './types';

const ConversationNavContext = createContext<ConversationNavValue | null>(null);

export function ConversationNavProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const routeConversationId = matchCopilotConversationId(location.pathname);
  const isDraftRoute = isCopilotDraftRoute(location.pathname);

  const { conversations, commitLocalDetail, getStoredDetail, removeLocalConversation } =
    useConversationStore();
  const deleteConversationMutation = useDeleteConversationMutation();
  const [draftResetNonce, setDraftResetNonce] = useState(0);

  const startNewConversation = useCallback(() => {
    if (isDraftRoute) {
      setDraftResetNonce((current) => current + 1);
      return;
    }
    navigate('/copilot');
  }, [isDraftRoute, navigate]);

  const openConversation = useCallback(
    (conversationId: string) => {
      if (conversationId === routeConversationId && !isDraftRoute) {
        return;
      }
      navigate(`/copilot/c/${conversationId}`);
    },
    [isDraftRoute, navigate, routeConversationId],
  );

  const deleteConversation = useCallback(
    async (conversationId: string) => {
      removeLocalConversation(conversationId);
      void deleteConversationMutation
        .mutateAsync(conversationId)
        .catch(discardUnavailableBackendError);

      if (routeConversationId === conversationId) {
        navigate('/copilot');
      }
    },
    [deleteConversationMutation, navigate, removeLocalConversation, routeConversationId],
  );

  const navValue = useMemo<ConversationNavValue>(
    () => ({
      conversations,
      isDraftRoute,
      activeConversationId: routeConversationId,
      startNewConversation,
      openConversation,
      deleteConversation,
    }),
    [
      conversations,
      isDraftRoute,
      routeConversationId,
      startNewConversation,
      openConversation,
      deleteConversation,
    ],
  );

  const storeApi = useMemo<ConversationStoreApi>(
    () => ({
      commitLocalDetail,
      getStoredDetail,
      draftResetNonce,
    }),
    [commitLocalDetail, getStoredDetail, draftResetNonce],
  );

  return (
    <ConversationStoreApiContext.Provider value={storeApi}>
      <ConversationNavContext.Provider value={navValue}>{children}</ConversationNavContext.Provider>
    </ConversationStoreApiContext.Provider>
  );
}

export function useConversationNav(): ConversationNavValue {
  const context = useContext(ConversationNavContext);
  if (!context) {
    throw new Error('useConversationNav must be used within ConversationNavProvider');
  }
  return context;
}
