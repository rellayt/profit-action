import {
  useCallback,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { useHealthQuery } from '../api/health';
import { useProductsQuery } from '../api/products';
import { useUpsertConversationMutation } from '../api/useConversations';
import { useAnalysisRegistry } from '../hooks/session/useAnalysisRegistry';
import {
  initialChatSessionId,
  useDeferredChatApply,
} from '../hooks/session/useDeferredChatApply';
import { useConversationPersistence } from '../hooks/session/useConversationPersistence';
import { useConversationRouting } from '../hooks/session/useConversationRouting';
import { useWorkspaceSubmit } from '../hooks/session/useWorkspaceSubmit';
import { useWorkspaceSwitch } from '../hooks/session/useWorkspaceSwitch';
import { useCopilotChat } from '../hooks/useCopilotChat';
import { buildAnalysisByMessageId } from '../lib/analysis/analysisBindings';
import { isDraftPendingApply, type PendingChatApply } from '../lib/chat/pendingChatApply';
import type { AnalysisResult, ClassifiedProduct } from '../types/api';
import { useConversationStoreApi } from './conversationStoreApi';
import { ChatMessagesContext } from './contexts/chatMessagesContext';
import { ComposerContext } from './contexts/composerContext';
import { isCopilotDraftRoute, matchCopilotConversationId } from './copilotRoutes';
import { InsightsContext } from './contexts/insightsContext';
import type { ChatMessagesValue, ComposerValue, InsightsValue } from './types';

function useCopilotWorkspaceState() {
  const location = useLocation();
  const routeConversationId = matchCopilotConversationId(location.pathname);
  const isDraftRoute = isCopilotDraftRoute(location.pathname);

  const { commitLocalDetail, getStoredDetail, draftResetNonce } = useConversationStoreApi();

  const [question, setQuestion] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<ClassifiedProduct | null>(null);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [insightsOpen, setInsightsOpen] = useState(false);

  const activeConversationIdRef = useRef<string | null>(routeConversationId);
  const applyPendingRef = useRef<(pending: PendingChatApply) => void>(() => {});

  const deliverPendingApply = useCallback((pending: PendingChatApply) => {
    applyPendingRef.current(pending);
  }, []);

  const chatSession = useDeferredChatApply(
    initialChatSessionId(routeConversationId),
    deliverPendingApply,
  );
  const {
    messages,
    streamState,
    beginAnalysisTurn,
    abortActiveStream,
    setMessages,
    reload,
    status,
    isAnalyzing,
  } = useCopilotChat(chatSession.chatSessionId);
  const { switchToConversation, switchToDraft, pendingApplyRef } = chatSession;

  const analysisRegistry = useAnalysisRegistry({
    messages,
    streamState,
    status,
  });
  const {
    analysesById,
    messageAnalysisIds,
    activeAnalysis,
    replaceFromDetail,
    clear: clearAnalyses,
    openAnalysis: registryOpenAnalysis,
    getAnalysisForMessage,
  } = analysisRegistry;

  const applyPendingChat = useEffectEvent((pending: PendingChatApply) => {
    if (isDraftPendingApply(pending)) {
      setMessages([]);
      clearAnalyses();
    } else {
      replaceFromDetail(pending.detail);
      setMessages(pending.detail.messages ?? []);
    }
    beginAnalysisTurn();
  });

  const clearComposerState = useCallback(() => {
    setInsightsOpen(false);
    setSelectedProduct(null);
    setQuestion('');
    setVoiceError(null);
  }, []);

  const setActiveConversationId = useCallback((conversationId: string | null) => {
    activeConversationIdRef.current = conversationId;
  }, []);

  const { applyDetail, resetToDraft } = useWorkspaceSwitch({
    draftResetNonce,
    abortActiveStream,
    switchToConversation,
    switchToDraft,
    clearComposerState,
    setActiveConversationId,
    applyPendingRef,
    onApplyPending: applyPendingChat,
  });

  const { isHydratingRef } = useConversationRouting({
    isDraftRoute,
    routeConversationId,
    activeConversationIdRef,
    setActiveConversationId,
    applyDetail,
    resetToDraft,
    commitLocalDetail,
  });

  const upsertConversationMutation = useUpsertConversationMutation();

  const { touchUpdatedAtRef } = useConversationPersistence({
    activeConversationIdRef,
    isHydratingRef,
    pendingChatApplyRef: pendingApplyRef,
    getStoredDetail,
    commitLocalDetail,
    upsertConversation: (detail) => upsertConversationMutation.mutateAsync(detail),
    messages,
    analysesById,
    messageAnalysisIds,
    status,
  });

  const { submitQuestion, runAnalysis, replayUserMessage } = useWorkspaceSubmit({
    isAnalyzing,
    messages,
    question,
    activeConversationIdRef,
    touchUpdatedAtRef,
    setActiveConversationId,
    setQuestion,
    setVoiceError,
    setSelectedProduct,
    beginAnalysisTurn,
    setMessages,
    reload,
    commitLocalDetail,
    upsertConversation: (detail) => upsertConversationMutation.mutateAsync(detail),
  });

  const healthQuery = useHealthQuery();
  const productsQuery = useProductsQuery();

  const classifiedById = useMemo(() => {
    const products = productsQuery.data?.items ?? [];
    return new Map(products.map((product) => [product.id, product]));
  }, [productsQuery.data?.items]);

  const analysisByMessageId = useMemo(
    () =>
      buildAnalysisByMessageId(
        messages,
        analysesById,
        messageAnalysisIds,
        streamState.analysis,
      ),
    [messages, analysesById, messageAnalysisIds, streamState.analysis],
  );

  const openAnalysis = useCallback(
    (analysisId: string, snapshot?: AnalysisResult | null) => {
      const found = registryOpenAnalysis(analysisId, snapshot);
      if (found) {
        setInsightsOpen(true);
      }
    },
    [registryOpenAnalysis],
  );

  const selectScatterProduct = useCallback(
    (productId: string) => {
      const match = classifiedById.get(productId);
      if (match) {
        setSelectedProduct(match);
      }
    },
    [classifiedById],
  );

  const chatMessages = useMemo<ChatMessagesValue>(
    () => ({
      messages,
      status,
      isAnalyzing,
      streamState,
      submitQuestion,
      replayUserMessage,
      backendUnavailable: healthQuery.isError || productsQuery.isError,
    }),
    [
      messages,
      status,
      isAnalyzing,
      streamState,
      submitQuestion,
      replayUserMessage,
      healthQuery.isError,
      productsQuery.isError,
    ],
  );

  const composer = useMemo<ComposerValue>(
    () => ({
      question,
      setQuestion,
      voiceError,
      setVoiceError,
      runAnalysis,
      isAnalyzing,
      submitQuestion,
    }),
    [question, voiceError, runAnalysis, isAnalyzing, submitQuestion],
  );

  const insights = useMemo<InsightsValue>(
    () => ({
      insightsOpen,
      setInsightsOpen,
      analysis: activeAnalysis,
      openAnalysis,
      getAnalysisForMessage,
      analysisByMessageId,
      selectedProduct,
      setSelectedProduct,
      selectScatterProduct,
      classifiedById,
    }),
    [
      insightsOpen,
      activeAnalysis,
      openAnalysis,
      getAnalysisForMessage,
      analysisByMessageId,
      selectedProduct,
      selectScatterProduct,
      classifiedById,
    ],
  );

  return { chatMessages, composer, insights };
}

export function CopilotWorkspaceProvider() {
  const { chatMessages, composer, insights } = useCopilotWorkspaceState();

  return (
    <ChatMessagesContext.Provider value={chatMessages}>
      <ComposerContext.Provider value={composer}>
        <InsightsContext.Provider value={insights}>
          <Outlet />
        </InsightsContext.Provider>
      </ComposerContext.Provider>
    </ChatMessagesContext.Provider>
  );
}
