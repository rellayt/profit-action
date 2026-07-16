import type { Message } from '@ai-sdk/react';

import { MessageRole } from '../chat/messageRole';
import type { AnalysisResult } from '../../types/api';
import { parseAnalysis } from './parseAnalysis';

export function bindPendingAnalyses(
  messages: Message[],
  currentBindings: Record<string, string>,
  pendingAnalysisIds: string[],
): { bindings: Record<string, string>; pendingIds: string[] } {
  const alreadyBound = new Set(Object.values(currentBindings));
  const pendingIds = pendingAnalysisIds.filter((id) => !alreadyBound.has(id));

  const unboundAssistantIds = messages
    .filter((message) => message.role === MessageRole.Assistant)
    .map((message) => message.id)
    .filter((id) => !currentBindings[id]);

  if (!unboundAssistantIds.length || !pendingIds.length) {
    return { bindings: currentBindings, pendingIds };
  }

  const nextBindings = { ...currentBindings };
  const nextPending = [...pendingIds];
  while (unboundAssistantIds.length && nextPending.length) {
    const messageId = unboundAssistantIds.shift();
    const analysisId = nextPending.shift();
    if (!messageId || !analysisId) {
      break;
    }
    nextBindings[messageId] = analysisId;
  }

  return { bindings: nextBindings, pendingIds: nextPending };
}

export function resolveAnalysisLookup(
  analysisId: string,
  analysesById: Record<string, AnalysisResult>,
  streamAnalysis: AnalysisResult | null | undefined,
  snapshot?: AnalysisResult | null,
): AnalysisResult | null {
  return parseAnalysis(
    snapshot ??
      analysesById[analysisId] ??
      (streamAnalysis?.analysisId === analysisId ? streamAnalysis : null),
  );
}

export function resolveAnalysisForMessage(
  messageId: string,
  messages: Message[],
  analysesById: Record<string, AnalysisResult>,
  messageAnalysisIds: Record<string, string>,
  streamAnalysis: AnalysisResult | null | undefined,
): AnalysisResult | null {
  const analysisId = messageAnalysisIds[messageId];
  if (analysisId) {
    return resolveAnalysisLookup(analysisId, analysesById, streamAnalysis);
  }

  const lastAssistant = [...messages]
    .reverse()
    .find((message) => message.role === MessageRole.Assistant);
  if (lastAssistant?.id !== messageId) {
    return null;
  }

  if (streamAnalysis && !Object.values(messageAnalysisIds).includes(streamAnalysis.analysisId)) {
    return parseAnalysis(streamAnalysis);
  }

  const storedAnalyses = Object.values(analysesById);
  if (storedAnalyses.length === 1 && Object.keys(messageAnalysisIds).length === 0) {
    return parseAnalysis(storedAnalyses[0]);
  }
  return null;
}

export function buildAnalysisByMessageId(
  messages: Message[],
  analysesById: Record<string, AnalysisResult>,
  messageAnalysisIds: Record<string, string>,
  streamAnalysis: AnalysisResult | null | undefined,
): Map<string, AnalysisResult> {
  const map = new Map<string, AnalysisResult>();
  for (const message of messages) {
    const analysis = resolveAnalysisForMessage(
      message.id,
      messages,
      analysesById,
      messageAnalysisIds,
      streamAnalysis,
    );
    if (analysis) {
      map.set(message.id, analysis);
    }
  }
  return map;
}
