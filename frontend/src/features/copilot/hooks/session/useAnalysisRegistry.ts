import type { Message } from '@ai-sdk/react';
import { useCallback, useEffect, useRef, useState } from 'react';

import {
  bindPendingAnalyses,
  resolveAnalysisForMessage,
  resolveAnalysisLookup,
} from '../../lib/analysis/analysisBindings';
import type { StreamUiState } from '../../lib/chat/streamEventParser';
import type { ChatStatus } from '../../lib/chat/chatStatus';
import type { AnalysisResult } from '../../types/api';
import type { ConversationDetail } from '../../types/conversation';

interface UseAnalysisRegistryOptions {
  messages: Message[];
  streamState: StreamUiState;
  status: ChatStatus;
}

export function useAnalysisRegistry({ messages, streamState, status }: UseAnalysisRegistryOptions) {
  const [analysesById, setAnalysesById] = useState<Record<string, AnalysisResult>>({});
  const [messageAnalysisIds, setMessageAnalysisIds] = useState<Record<string, string>>({});
  const [activeAnalysisId, setActiveAnalysisId] = useState<string | null>(null);
  const pendingAnalysisIdsRef = useRef<string[]>([]);

  const replaceFromDetail = useCallback((detail: ConversationDetail) => {
    setAnalysesById(detail.analysesById);
    setMessageAnalysisIds(detail.messageAnalysisIds);
    setActiveAnalysisId(null);
    pendingAnalysisIdsRef.current = [];
  }, []);

  const clear = useCallback(() => {
    setAnalysesById({});
    setMessageAnalysisIds({});
    setActiveAnalysisId(null);
    pendingAnalysisIdsRef.current = [];
  }, []);

  useEffect(() => {
    const analysis = streamState.analysis;
    if (analysis) {
      setAnalysesById((current) => ({
        ...current,
        [analysis.analysisId]: analysis,
      }));
      if (!pendingAnalysisIdsRef.current.includes(analysis.analysisId)) {
        pendingAnalysisIdsRef.current.push(analysis.analysisId);
      }
    }

    if (!pendingAnalysisIdsRef.current.length) {
      return;
    }

    setMessageAnalysisIds((currentBindings) => {
      const next = bindPendingAnalyses(messages, currentBindings, pendingAnalysisIdsRef.current);
      pendingAnalysisIdsRef.current = next.pendingIds;
      return next.bindings;
    });
  }, [streamState.analysis, status, messages]);

  const openAnalysis = (
    analysisId: string,
    snapshot?: AnalysisResult | null,
  ): AnalysisResult | null => {
    const found = resolveAnalysisLookup(analysisId, analysesById, streamState.analysis, snapshot);
    if (!found) {
      return null;
    }
    setAnalysesById((current) => ({
      ...current,
      [found.analysisId]: found,
    }));
    setActiveAnalysisId(found.analysisId);
    return found;
  };

  function getAnalysisForMessage(messageId: string): AnalysisResult | null {
    return resolveAnalysisForMessage(
      messageId,
      messages,
      analysesById,
      messageAnalysisIds,
      streamState.analysis,
    );
  }

  const activeAnalysis =
    (activeAnalysisId ? analysesById[activeAnalysisId] : null) ?? streamState.analysis;

  return {
    analysesById,
    messageAnalysisIds,
    activeAnalysis,
    replaceFromDetail,
    clear,
    openAnalysis,
    getAnalysisForMessage,
  };
}
