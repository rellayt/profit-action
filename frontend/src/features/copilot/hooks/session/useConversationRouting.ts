import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, type RefObject } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { fetchConversationDetail } from '../../api/conversations';
import { conversationQueryKeys } from '../../api/queryKeys';
import { mergeConversationDetails } from '../../lib/conversation/conversationMerge';
import { loadConversationStorage } from '../../lib/conversation/conversationStorage';
import type { ConversationDetail } from '../../types/conversation';

export type CopilotLocationState = {
  skipHydrateFor?: string;
};

interface UseConversationRoutingOptions {
  isDraftRoute: boolean;
  routeConversationId: string | null;
  activeConversationIdRef: RefObject<string | null>;
  setActiveConversationId: (conversationId: string | null) => void;
  applyDetail: (detail: ConversationDetail) => void;
  resetToDraft: () => void;
  commitLocalDetail: (detail: ConversationDetail) => void;
}

export function useConversationRouting({
  isDraftRoute,
  routeConversationId,
  activeConversationIdRef,
  setActiveConversationId,
  applyDetail,
  resetToDraft,
  commitLocalDetail,
}: UseConversationRoutingOptions) {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const isHydratingRef = useRef(false);

  const skipHydrateFor =
    (location.state as CopilotLocationState | null)?.skipHydrateFor ?? null;

  const latestRef = useRef({
    activeConversationIdRef,
    applyDetail,
    commitLocalDetail,
    navigate,
    queryClient,
    resetToDraft,
    setActiveConversationId,
  });
  latestRef.current = {
    activeConversationIdRef,
    applyDetail,
    commitLocalDetail,
    navigate,
    queryClient,
    resetToDraft,
    setActiveConversationId,
  };

  useEffect(() => {
    const {
      activeConversationIdRef: activeIdRef,
      applyDetail: apply,
      commitLocalDetail: commit,
      navigate: go,
      queryClient: client,
      resetToDraft: reset,
      setActiveConversationId: setActiveId,
    } = latestRef.current;

    if (isDraftRoute) {
      reset();
      return;
    }

    if (!routeConversationId) {
      return;
    }

    if (skipHydrateFor === routeConversationId) {
      activeIdRef.current = routeConversationId;
      setActiveId(routeConversationId);
      return;
    }

    let cancelled = false;

    const loadRouteConversation = async () => {
      isHydratingRef.current = true;
      activeIdRef.current = routeConversationId;
      setActiveId(routeConversationId);

      const local = loadConversationStorage().detailsById[routeConversationId];
      if (local) {
        apply(local);
      }

      try {
        const remote = await client.fetchQuery({
          queryKey: conversationQueryKeys.detail(routeConversationId),
          queryFn: () => fetchConversationDetail(routeConversationId),
        });
        if (cancelled || activeIdRef.current !== routeConversationId) {
          return;
        }
        const mergedDetail = mergeConversationDetails(local, remote);
        apply(mergedDetail);
        commit(mergedDetail);
      } catch {
        if (!local && !cancelled) {
          go('/copilot', { replace: true });
        }
      } finally {
        if (!cancelled) {
          isHydratingRef.current = false;
        }
      }
    };

    void loadRouteConversation();
    return () => {
      cancelled = true;
      isHydratingRef.current = false;
    };
  }, [isDraftRoute, routeConversationId, skipHydrateFor]);

  return {
    isHydratingRef,
  };
}
