import { MessageRole } from '../chat/messageRole';
import type { AnalysisResult } from '../../types/api';

export function repairMessageAnalysisBindings(
  messages: Array<{ id: string; role: string }>,
  analysesById: Record<string, AnalysisResult>,
  bindings: Record<string, string>,
): Record<string, string> {
  if (Object.keys(bindings).length > 0) {
    return bindings;
  }
  const analysisIds = Object.keys(analysesById);
  if (analysisIds.length === 0) {
    return bindings;
  }
  const assistants = messages.filter((message) => message.role === MessageRole.Assistant);
  if (assistants.length === 0) {
    return bindings;
  }
  const next = { ...bindings };
  const count = Math.min(assistants.length, analysisIds.length);
  for (let index = 0; index < count; index += 1) {
    const message = assistants[index];
    const analysisId = analysisIds[index];
    if (message && analysisId) {
      next[message.id] = analysisId;
    }
  }
  return next;
}
