import type { AnalysisResult } from '../../types/api';

type ListCountAnalysis = Pick<
  AnalysisResult,
  'operation' | 'matchedProducts' | 'matchedProductIds' | 'summary'
> & {
  plan: { limit?: number | null };
};

export function analysisListCount(analysis: ListCountAnalysis): number {
  if (analysis.operation !== 'list') {
    return analysis.summary.matchedProducts;
  }
  const fromRows = analysis.matchedProducts.length;
  const fromIds = analysis.matchedProductIds.length;
  const fromSummary = analysis.summary.matchedProducts;
  const limit =
    typeof analysis.plan.limit === 'number' && analysis.plan.limit > 0 ? analysis.plan.limit : null;
  const counted = fromRows || fromIds || fromSummary;
  return limit != null ? Math.min(counted, limit) : counted;
}
