import type { AnalysisResult, ClassifiedProduct } from '../../../contracts/generated/schemas';

export type { AnalysisResult, ClassifiedProduct };

export type DataFreshness = ClassifiedProduct['freshness'][number];
export type ProductSegment = ClassifiedProduct['segment'];

export type AnalysisKpi = AnalysisResult['kpis'][number];
export type ChartPoint = AnalysisResult['chartPoints'][number];
export type MatchedProductRow = AnalysisResult['matchedProducts'][number];
