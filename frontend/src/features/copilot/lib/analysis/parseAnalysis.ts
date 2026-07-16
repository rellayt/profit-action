import { AnalysisResultSchema, type AnalysisResult } from '../../../../contracts/generated/schemas';

export function parseAnalysis(value: unknown): AnalysisResult | null {
  const parsed = AnalysisResultSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

export function parseAnalysesById(value: unknown): Record<string, AnalysisResult> {
  if (!value || typeof value !== 'object') {
    return {};
  }
  const next: Record<string, AnalysisResult> = {};
  for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    const parsed = parseAnalysis(item);
    if (parsed) {
      next[parsed.analysisId || key] = parsed;
    }
  }
  return next;
}
