import type { AnalysisResult } from '../../types/api';
import type { ConversationDetail } from '../../types/conversation';
import { parseAnalysesById } from '../analysis/parseAnalysis';
import { repairMessageAnalysisBindings } from './messageAnalysisBindings';

function analysisRichness(analysis: AnalysisResult): number {
  return (
    analysis.matchedProducts.length +
    analysis.matchedProductIds.length +
    analysis.chartPoints.length +
    (analysis.showCta ? 1 : 0)
  );
}

function preferRicherAnalysis(
  localAnalysis: AnalysisResult | undefined,
  remoteAnalysis: AnalysisResult | undefined,
): AnalysisResult | undefined {
  if (!localAnalysis) {
    return remoteAnalysis;
  }
  if (!remoteAnalysis) {
    return localAnalysis;
  }
  return analysisRichness(remoteAnalysis) >= analysisRichness(localAnalysis)
    ? remoteAnalysis
    : localAnalysis;
}

export function hydrateConversationDetail(detail: ConversationDetail): ConversationDetail {
  const analysesById = parseAnalysesById(detail.analysesById);
  const messageAnalysisIds = repairMessageAnalysisBindings(
    detail.messages ?? [],
    analysesById,
    detail.messageAnalysisIds ?? {},
  );
  return {
    ...detail,
    analysesById,
    messageAnalysisIds,
  };
}

export function mergeConversationDetails(
  local: ConversationDetail | undefined,
  remote: ConversationDetail,
): ConversationDetail {
  const localHydrated = local ? hydrateConversationDetail(local) : undefined;
  const remoteHydrated = hydrateConversationDetail(remote);
  const analysisIds = new Set([
    ...Object.keys(localHydrated?.analysesById ?? {}),
    ...Object.keys(remoteHydrated.analysesById),
  ]);
  const analysesById: Record<string, AnalysisResult> = {};
  for (const id of analysisIds) {
    const chosen = preferRicherAnalysis(
      localHydrated?.analysesById[id],
      remoteHydrated.analysesById[id],
    );
    if (chosen) {
      analysesById[id] = chosen;
    }
  }
  const messages = remoteHydrated.messages?.length
    ? remoteHydrated.messages
    : (localHydrated?.messages ?? []);
  const messageAnalysisIds = repairMessageAnalysisBindings(messages, analysesById, {
    ...(localHydrated?.messageAnalysisIds ?? {}),
    ...(remoteHydrated.messageAnalysisIds ?? {}),
  });
  return {
    ...remoteHydrated,
    messages,
    analysesById,
    messageAnalysisIds,
  };
}
